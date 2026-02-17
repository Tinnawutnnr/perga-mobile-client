// ble-type.ts
import { Device } from "react-native-ble-plx";

export interface GaitSensorData {
  timestamp: string;
  gyro_z: number;
}

export interface BluetoothDeviceDisplay {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean | null;
  rawDevice: Device;
}