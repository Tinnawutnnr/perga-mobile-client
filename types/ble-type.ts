// ble-type.ts
import { Device } from "react-native-ble-plx";

export interface BluetoothDeviceDisplay {
  id: string;
  name: string | null;
  rssi: number | null;
  isConnectable: boolean | null;
  rawDevice: Device;
}