import { useState, useEffect, useRef} from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import { BleManager, Device} from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as ExpoDevice from "expo-device";
import { BluetoothDeviceDisplay, GaitSensorData } from "@/types/ble-type";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const SERVICE_UUID = process.env.EXPO_PUBLIC_BLE_SERVICE_UUID;
const CHARACTERISTIC_UUID = process.env.EXPO_PUBLIC_BLE_CHARACTERISTIC_UUID;

if (!SERVICE_UUID || !CHARACTERISTIC_UUID) {
  throw new Error("BLE UUIDs are missing config!");
}

const isWeb = Platform.OS === 'web'

// create manager
const manager = !isWeb ? new BleManager() : null;

export const useBLE = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [foundDevices, setFoundDevices] = useState<BluetoothDeviceDisplay[]>([]);

  const [userId] = useState("user_test"); // for future backend integration
  
  const currentSessionId = useRef<string | null>(null);
  const dataAccumulator = useRef<number[]>([]);

  useEffect(() => {
    if (isWeb || !manager) return;
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
      }
    }, true);
    return () => {
      subscription.remove();
      manager.stopDeviceScan(); // Cleanup Scan
      manager.destroy(); // Fully release BLE resources
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true;
  };

  const scanForDevices = async () => {
    const permission = await requestPermissions();
    if (!permission) {
      Alert.alert("Permission Denied", "Bluetooth permissions are required.");
      return;
    }

    if (!manager) return;
    setIsScanning(true);
    setFoundDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        setFoundDevices((prev) => {
          if (!prev.some((d) => d.id === device.id)) {
            return [
              ...prev,
              {
                id: device.id,
                name: device.name,
                rssi: device.rssi,
                isConnectable: device.isConnectable,
                rawDevice: device,
              },
            ];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      if (manager) manager.stopDeviceScan();
      setIsScanning(false);

      const connected = await device.connect();
      setConnectedDevice(connected);

      currentSessionId.current = uuidv4();
      console.log(`Session Started: ${currentSessionId.current} for User: ${userId}`);
      
      await connected.discoverAllServicesAndCharacteristics();
      Alert.alert("Connected", `Connected to ${device.name}`);
      
      startStreaming(connected);

    } catch (e) {
      console.log("Connection Error", e);
      currentSessionId.current = null;
      Alert.alert("Error", "Connection failed");
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      currentSessionId.current = null;
      console.log("Session Ended");
    }
  };

  const startStreaming = async (device: Device) => {
    device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.log("Monitor Error", error);
          return;
        }
        if (characteristic?.value) {
          processBatchData(characteristic.value);
        }
      }
    );
  };

  const processBatchData = (base64Data: string) => {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Decode Float LE (Batch 25)
    for (let i = 0; i < buffer.length; i += 4) {
      dataAccumulator.current.push(buffer.readFloatLE(i));
    }

    // Accumulate until 100 samples (1 second)
    if (dataAccumulator.current.length >= 100) {
      const chunk = dataAccumulator.current.slice(0, 100);
      dataAccumulator.current = dataAccumulator.current.slice(100); // Keep excess if any
      
      handleOneSecondData(chunk);
    }
  };

  const handleOneSecondData = (data: number[]) => {
    if (!currentSessionId.current) return;
    const now = Date.now();
    const intervalMs = 10; // 100Hz
    
    const formatToUTC7 = (ms: number) => {
      // shift by +7 hours then produce ISO-like string with +07:00 offset
      const shifted = new Date(ms + 7 * 60 * 60 * 1000);
      return shifted.toISOString().replace("Z", "+07:00");
    };

    const finalizedData: GaitSensorData[] = data.map((val, index) => {
      // Logic now - 990ms
      const offset = (data.length - 1 - index) * intervalMs;
      return {
        timestamp: formatToUTC7(now - offset),
        gyro_z: parseFloat(val.toFixed(4)),
      };
    });
    
    const payload = {
      userId: userId,
      sessionId: currentSessionId.current,
      data: finalizedData
    };

    console.log("Sending Batch to Server...", payload.sessionId);
    console.log(payload)
    // sendToBackend(payload);
  };

//   const sendToBackend = async (payload: any) => {
//     try {
//       const API_URL = process.env.EXPO_PUBLIC_API_URL;
      
//       const response = await fetch(`${API_URL}/gait/batch`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         console.warn(response.status);
//       }
//     } catch (error) {
//       console.error("Internal Server Error:", error);
//     }
//   };

  return {
    isScanning,
    foundDevices,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    isWeb,
  };
};