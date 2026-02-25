import { BluetoothDeviceDisplay, GaitSensorData } from "@/types/ble-type";
import { Buffer } from "buffer";
import * as ExpoDevice from "expo-device";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { create } from "zustand";

const IS_WEB = Platform.OS === "web";
const SERVICE_UUID = process.env.EXPO_PUBLIC_BLE_SERVICE_UUID;
const CHARACTERISTIC_UUID = process.env.EXPO_PUBLIC_BLE_CHARACTERISTIC_UUID;
if (
  !IS_WEB &&
  (
    !SERVICE_UUID ||
    !CHARACTERISTIC_UUID ||
    SERVICE_UUID.trim() === "" ||
    CHARACTERISTIC_UUID.trim() === ""
  )
) {
  throw new Error("BLE UUIDs are missing or empty in config!");
}
const SCAN_DURATION_MS = 10_000;
const BATCH_SIZE = 100;
const SAMPLE_INTERVAL_MS = 10; // for split 10 ms between samples

// ─── Singleton BleManager ────────────────────────────────────────────────────
//    Only ONE BleManager must exist in the whole app.
const bleManager: BleManager | null = !IS_WEB ? new BleManager() : null;

let dataAccumulator: number[] = [];
let monitorSubscription: { remove: () => void } | null = null;
let scanTimeoutId: ReturnType<typeof setTimeout> | null = null;

/** Build an ISO-8601 timestamp carrying the device's local UTC offset. */
const formatWithLocalOffset = (ms: number): string => {
  const date = new Date(ms);
  const isoWithoutZ = date.toISOString().slice(0, -1); // remove trailing 'Z'
  const offsetMinutes = date.getTimezoneOffset(); // minutes behind UTC
  const absMinutes = Math.abs(offsetMinutes);
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const minutes = String(absMinutes % 60).padStart(2, "0");
  return `${isoWithoutZ}${sign}${hours}:${minutes}`;
};

/** Android-only BLE permission request. iOS uses Info.plist entitlements. */
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
  // Most recent parsed sensor reading
  lastBleData: { z: number; timestamp: number } | null;
  // Batch that is pending to publish
  pendingBatch: GaitSensorData[];

  isWeb: boolean;
  scanForDevices: () => Promise<void>;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  /** Begin monitoring the BLE characteristic. Call from ActivityScreen. */
  startStreaming: () => void;
  /** Stop monitoring and clean up the native subscription. */
  stopStreaming: () => void;
}

// Zustand store
export const useBleStore = create<BleState>()((set, get) => {
  const processBatchData = (base64Data: string): void => {
    const buffer = Buffer.from(base64Data, "base64");

    let lastVal = 0;
    for (let i = 0; i + 3 < buffer.length; i += 4) {
      const val = buffer.readFloatLE(i);
      dataAccumulator.push(val);
      lastVal = val;
    }

    set({
      lastBleData: {
        z: parseFloat(lastVal.toFixed(4)),
        timestamp: Date.now(),
      },
    });

    // Flush every BATCH_SIZE samples (use `while` for robustness in case a
    // single notification brings enough data to span multiple batches).
    while (dataAccumulator.length >= BATCH_SIZE) {
      const chunk = dataAccumulator.slice(0, BATCH_SIZE);
      dataAccumulator = dataAccumulator.slice(BATCH_SIZE);
      finalizeBatch(chunk);
    }
  };

  // Convert raw float values into timestamped `GaitSensorData[]`
  const finalizeBatch = (data: number[]): void => {
    const now = Date.now();

    const finalizedData: GaitSensorData[] = data.map((val, index) => {
      const offset = (data.length - 1 - index) * SAMPLE_INTERVAL_MS;
      return {
        timestamp: formatWithLocalOffset(now - offset),
        gyro_z: parseFloat(val.toFixed(4)),
      };
    });

    // Setting a new array reference guarantees useEffect in consumers fires.
    set({ pendingBatch: finalizedData });
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
        Alert.alert("Permission Denied", "Bluetooth permissions are required.");
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
              return state; // no-op → no re-render
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

      // Auto-stop scan after SCAN_DURATION_MS
      if (scanTimeoutId) clearTimeout(scanTimeoutId);
      scanTimeoutId = setTimeout(() => {
        bleManager.stopDeviceScan();
        set({ isScanning: false });
        console.log(`Scan stopped after ${SCAN_DURATION_MS} ms`);
      }, SCAN_DURATION_MS);
    },

    connectToDevice: async (device: Device) => {
      try {
        // Stop any ongoing scan
        if (bleManager) bleManager.stopDeviceScan();
        if (scanTimeoutId) {
          clearTimeout(scanTimeoutId);
          scanTimeoutId = null;
        }
        set({ isScanning: false });

        const connected = await device.connect();
        await connected.discoverAllServicesAndCharacteristics();
        set({ connectedDevice: connected });

        Alert.alert("Connected", `Connected to ${device.name}`);
        console.log("BLE Connected");
      } catch (e) {
        console.error("Connection Error:", e);
        Alert.alert("Error", "Connection failed");
      }
    },

    disconnectDevice: async () => {
      const { connectedDevice } = get();
      if (!connectedDevice) return;

      // Always stop streaming BEFORE disconnecting to avoid a leaked
      get().stopStreaming();

      try {
        await connectedDevice.cancelConnection();
      } catch (e) {
        console.warn(
          "Disconnect error (device may already be disconnected):",
          e,
        );
      }

      set({ connectedDevice: null, lastBleData: null });
      console.log("BLE Disconnected");
    },

    startStreaming: () => {
      const { connectedDevice } = get();
      if (!connectedDevice) return;

      // Reset accumulator for a fresh streaming session
      dataAccumulator = [];

      // Remove any previous subscription before creating a new one.
      if (monitorSubscription) {
        monitorSubscription.remove();
        monitorSubscription = null;
      }

      monitorSubscription = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID!,
        CHARACTERISTIC_UUID!,
        (error, characteristic) => {
          if (error) {
            console.error("Monitor error:", error);
            return;
          }
          if (characteristic?.value) {
            processBatchData(characteristic.value);
          }
        },
      );

      set({ isStreaming: true });
      console.log("BLE streaming started");
    },

    stopStreaming: () => {
      // Always remove the monitor subscription
      //    before it goes out of scope or the device disconnects.
      if (monitorSubscription) {
        monitorSubscription.remove();
        monitorSubscription = null;
      }
      set({ isStreaming: false });
      console.log("BLE streaming stopped");
    },
  };
});

// NOTE: This subscription intentionally lives for the entire
//    app lifetime. No cleanup is needed because the OS reclaims resources
//    when the process exits.
if (bleManager) {
  bleManager.onStateChange((state) => {
    if (state === "PoweredOn") {
      console.log("BLE adapter powered on");
    }
  }, true);
}
