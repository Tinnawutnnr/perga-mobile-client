import { BluetoothDeviceDisplay } from "@/types/ble-type";
import { Buffer } from "buffer";
import * as ExpoDevice from "expo-device";
import { PermissionsAndroid, Platform } from "react-native";
import { toast } from "@/store/toast-store";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { create } from "zustand";

const IS_WEB = Platform.OS === "web";
const SERVICE_UUID = process.env.EXPO_PUBLIC_BLE_SERVICE_UUID;
const CHARACTERISTIC_UUID = process.env.EXPO_PUBLIC_BLE_CHARACTERISTIC_UUID;

if (
  !IS_WEB &&
  (!SERVICE_UUID ||
    !CHARACTERISTIC_UUID ||
    SERVICE_UUID.trim() === "" ||
    CHARACTERISTIC_UUID.trim() === "")
) {
  throw new Error("BLE UUIDs are missing or empty in config!");
}

const SCAN_DURATION_MS = 10_000;
const BATCH_SIZE = 100;

// ─── Singleton BleManager ────────────────────────────────────────────────────
const bleManager: BleManager | null = !IS_WEB ? new BleManager() : null;

let dataAccumulator: number[] = [];
let monitorSubscription: Subscription | null = null;
let scanTimeoutId: ReturnType<typeof setTimeout> | null = null;

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);
  return (
    result["android.permission.BLUETOOTH_CONNECT"] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    result["android.permission.BLUETOOTH_SCAN"] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
}

export interface BleState {
  isScanning: boolean;
  foundDevices: BluetoothDeviceDisplay[];
  connectedDevice: Device | null;
  isStreaming: boolean;
  lastBleData: { z: number; timestamp: number } | null;
  pendingBatch: number[];
  isWeb: boolean;
  scanForDevices: () => Promise<void>;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  startStreaming: () => void;
  stopStreaming: () => void;
}

export const useBleStore = create<BleState>()((set, get) => {
  const processBatchData = (base64Data: string): void => {
    const buffer = Buffer.from(base64Data, "base64");

    const nowObj = new Date();
    const ts = `${nowObj.toLocaleTimeString("en-GB", { hour12: false })}.${nowObj.getMilliseconds().toString().padStart(3, "0")}`;

    let lastVal = 0;
    const incomingCount = buffer.length / 4; 

    for (let i = 0; i + 3 < buffer.length; i += 4) {
      const val = buffer.readFloatLE(i);
      dataAccumulator.push(val);
      lastVal = val;
    }

    console.log(
      `[${ts}] BLE Received: +${incomingCount} samples | Acc: ${dataAccumulator.length}/${BATCH_SIZE}`,
    );

    set({
      lastBleData: {
        z: parseFloat(lastVal.toFixed(4)),
        timestamp: Date.now(),
      },
    });

    while (dataAccumulator.length >= BATCH_SIZE) {
      const chunk = dataAccumulator.slice(0, BATCH_SIZE);
      dataAccumulator = dataAccumulator.slice(BATCH_SIZE);

      console.log(
        `[${ts}]Batch Full! Flushing ${BATCH_SIZE} samples to MQTT...`,
      );
      set({ pendingBatch: chunk });
    }
  };

  return {
    isScanning: false,
    foundDevices: [],
    connectedDevice: null,
    isStreaming: false,
    lastBleData: null,
    pendingBatch: [],
    isWeb: IS_WEB,

    scanForDevices: async () => {
      if (!bleManager) return;
      const hasPermission = await requestBlePermissions();
      if (!hasPermission) {
        toast.error("Bluetooth permission required");
        return;
      }

      set({ isScanning: true, foundDevices: [] });

      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.warn("Scan error:", error);
          set({ isScanning: false });
          return;
        }

        if (device?.name) {
          set((state) => {
            if (state.foundDevices.some((d) => d.id === device.id))
              return state;
            return {
              foundDevices: [
                ...state.foundDevices,
                {
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi,
                  isConnectable: device.isConnectable,
                  rawDevice: device,
                },
              ],
            };
          });
        }
      });

      if (scanTimeoutId) clearTimeout(scanTimeoutId);
      scanTimeoutId = setTimeout(() => {
        bleManager.stopDeviceScan();
        set({ isScanning: false });
      }, SCAN_DURATION_MS);
    },

    connectToDevice: async (device: Device) => {
      try {
        if (bleManager) bleManager.stopDeviceScan();
        set({ isScanning: false });

        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();

        // Android Optimization: Expand MTU and Set Priority
        if (Platform.OS === "android") {
          try {
            // expand mtu to 256 bytes
            const mtuDevice = await connected.requestMTU(256);
            console.log(
              `[BLE] Android MTU expanded to: ${mtuDevice.mtu} bytes`,
            );

            await connected.requestConnectionPriority(1); // 1 = High Priority
            console.log("[BLE] Android Connection Priority set to High");
          } catch (configError) {
            console.warn(
              "[BLE] Android Config Error (MTU/Priority):",
              configError,
            );
          }
        }

        set({ connectedDevice: connected });
        toast.success(`Connected to ${device.name}`);
      } catch (e) {
        console.error("Connection Error:", e);
        toast.error("Connection failed");
      }
    },

    disconnectDevice: async () => {
      const { connectedDevice } = get();
      if (!connectedDevice) return;

      get().stopStreaming();

      try {
        await connectedDevice.cancelConnection();
      } catch (e) {
        console.warn("Disconnect error:", e);
      }

      monitorSubscription = null;
      set({ connectedDevice: null, lastBleData: null, isStreaming: false });
      console.log("BLE Disconnected and Subscription cleared");
    },

    startStreaming: () => {
      const { connectedDevice } = get();
      if (!connectedDevice) return;

      dataAccumulator = [];
      set({ pendingBatch: [], isStreaming: true });

      if (monitorSubscription) {
        console.log("BLE Streaming: Resuming existing subscription");
        return;
      }

      monitorSubscription = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID!,
        CHARACTERISTIC_UUID!,
        (error, characteristic) => {
          if (!get().isStreaming) return;

          if (error) {
            if (error.errorCode === 2) return;
            console.error("Monitor error:", error);
            return;
          }
          if (characteristic?.value) {
            processBatchData(characteristic.value);
          }
        },
      );

      console.log("BLE streaming started");
    },

    stopStreaming: () => {
      set({ isStreaming: false });
      console.log("BLE streaming soft-stopped (Flag set to false)");
    },
  };
});

if (bleManager) {
  bleManager.onStateChange((state) => {
    if (state === "PoweredOn") {
      console.log("BLE adapter powered on");
    }
  }, true);
}
