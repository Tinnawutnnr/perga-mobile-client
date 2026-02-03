import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
  rssi?: number;
  type: 'sensor' | 'phone' | 'other';
}

// Mock data for BLE devices
const MOCK_BLUETOOTH_DEVICES: BluetoothDevice[] = [
  {
    id: "1",
    name: "device 1",
    isConnected: true,
    rssi: -10,
    type: "sensor",
  },
  {
    id: "2",
    name: "device 2",
    isConnected: false,
    rssi: -33,
    type: "sensor",
  },
  {
    id: "3",
    name: "device 3",
    isConnected: false,
    rssi: -58,
    type: "sensor",
  },
];

const BLEConnectionScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>(MOCK_BLUETOOTH_DEVICES);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'muted');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert("Scan Complete", "Found nearby devices");
    }, 3000);
  };

  const handleConnect = (deviceId: string) => {
        const device = devices.find((d) => d.id === deviceId);
        if (!device) {
          return;
        }
        const newIsConnected = !device.isConnected;
        setDevices((prev) =>
          prev.map((d) =>
            d.id === deviceId ? { ...d, isConnected: newIsConnected } : d,
          ),
        );
        Alert.alert(
          newIsConnected ? "Device Connected" : "Device Disconnected",
          `${device.name} is now ${newIsConnected ? "connected" : "disconnected"}.`,
        );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return 'fitness-outline';
      case 'phone': return 'phone-portrait-outline';
      default: return 'hardware-chip-outline';
    }
  };

  const getSignalStrength = (rssi?: number) => {
    if (rssi === undefined || rssi < -90) return "cellular-outline";
    if (rssi > -30) return "cellular";
    if (rssi > -50) return "cellular-sharp";
    if (rssi > -70) return "cellular-outline";
    return "cellular-outline";
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity 
      style={[styles.deviceCard, { backgroundColor: cardColor, borderColor }]}
      onPress={() => handleConnect(item.id)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.deviceInfo}>
        <ThemedView style={styles.deviceHeader}>
          <Ionicons 
            name={getDeviceIcon(item.type) as any} 
            size={24} 
            color={item.isConnected ? tintColor : iconColor} 
          />
          <ThemedView style={styles.deviceDetails}>
            <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
            <ThemedText type="muted" style={styles.deviceId}>ID: {item.id}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.deviceStatus}>
            <Ionicons 
              name={getSignalStrength(item.rssi) as any} 
              size={16} 
              color={mutedColor} 
            />
            <ThemedText type="muted" style={styles.rssiText}>
              {item.rssi ? `${item.rssi} dBm` : 'N/A'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.connectionStatus}>
          <ThemedView style={[
            styles.statusIndicator, 
            { backgroundColor: item.isConnected ? '#4CAF50' : '#FF9800' }
          ]} />
          <ThemedText style={[
            styles.statusText,
            { color: item.isConnected ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.isConnected ? 'Connected' : 'Available'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            BLE Connection
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.scanButton,
              { backgroundColor: isScanning ? mutedColor : tintColor },
            ]}
            onPress={handleScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isScanning ? "refresh" : "bluetooth"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </ThemedView>

        {/* Connection Status */}
        <ThemedView
          style={[
            styles.statusCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <ThemedView style={styles.statusHeader}>
            <Ionicons name="bluetooth" size={24} color={tintColor} />
            <ThemedText style={styles.statusTitle}>Bluetooth Status</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusContent}>
            <ThemedView
              style={[styles.statusIndicator, { backgroundColor: mutedColor }]}
            />
            {/* add state for later use if ble is on set to '#4CAF50' */}
            <ThemedText style={styles.statusDescription}>
              Bluetooth status depends on your device settings. Ensure Bluetooth
              is enabled to scan for devices.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Connected Devices */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Connected Devices
            </ThemedText>
            <ThemedView style={[styles.badge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.badgeText}>
                {devices.filter((d) => d.isConnected).length}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          {devices.filter((device) => device.isConnected).length === 0 ? (
            <ThemedView
              style={[
                styles.emptyState,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Ionicons name="bluetooth-outline" size={48} color={mutedColor} />
              <ThemedText type="muted" style={styles.emptyText}>
                No connected devices
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={devices.filter((device) => device.isConnected)}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </ThemedView>

        {/* Available Devices */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Available Devices
            </ThemedText>
            <TouchableOpacity onPress={handleScan} disabled={isScanning}>
              <ThemedText
                style={[
                  styles.scanText,
                  { color: isScanning ? mutedColor : tintColor },
                ]}
              >
                {isScanning ? "Scanning..." : "Scan"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <FlatList
            data={devices.filter((device) => !device.isConnected)}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </ThemedView>

        {/* Help Section */}
        <ThemedView
          style={[styles.helpCard, { backgroundColor: cardColor, borderColor }]}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={tintColor}
          />
          <ThemedView style={styles.helpContent}>
            <ThemedText style={styles.helpTitle}>
              Having trouble connecting?
            </ThemedText>
            <ThemedText type="muted" style={styles.helpText}>
              Make sure Bluetooth is enabled and your device is discoverable.
              Try restarting Bluetooth if connection fails.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BLEConnectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scanText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  deviceInfo: {
    gap: 12,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  deviceId: {
    fontSize: 12,
  },
  deviceStatus: {
    alignItems: "flex-end",
  },
  rssiText: {
    fontSize: 12,
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  helpCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 24,
    borderWidth: 1,
  },
  helpContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
