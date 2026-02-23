// screens/BLEConnectionScreen.tsx
import React, { useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";
import { useBLE } from "@/hooks/use-ble";
import { BluetoothDeviceDisplay } from "@/types/ble-type";
import BleNotAvailablePage from "./ble-unavailable";
import { useMqtt } from "@/hooks/use-mqtt";

const BLEConnectionScreen = () => {
  const { 
    isScanning, 
    foundDevices, 
    connectedDevice, 
    scanForDevices, 
    connectToDevice, 
    disconnectDevice,
    isWeb
  } = useBLE();

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'muted');
  const iconColor = useThemeColor({}, "icon");

  const getSignalStrength = (rssi: number | null) => {
    if (!rssi || rssi < -90) return "cellular-outline";
    if (rssi > -30) return "cellular";
    if (rssi > -50) return "cellular-sharp";
    return "cellular-outline";
  };

  const renderDevice = ({ item }: { item: BluetoothDeviceDisplay }) => {
    const isConnected = connectedDevice?.id === item.id;
    return (
      <TouchableOpacity 
        style={[styles.deviceCard, { backgroundColor: cardColor, borderColor }]}
        onPress={() => isConnected ? disconnectDevice() : connectToDevice(item.rawDevice)}
        activeOpacity={0.7}
      >
        <ThemedView transparent style={styles.deviceInfo}>
          <ThemedView transparent style={styles.deviceHeader}>
            <Ionicons 
              name="hardware-chip-outline" 
              size={24} 
              color={isConnected ? tintColor : iconColor} 
            />
            <ThemedView transparent style={styles.deviceDetails}>
              <ThemedText style={styles.deviceName}>{item.name || "Unknown Device"}</ThemedText>
              <ThemedText type="muted" style={styles.deviceId}>ID: {item.id}</ThemedText>
            </ThemedView>
            <ThemedView transparent style={styles.deviceStatus}>
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
          <ThemedView transparent style={styles.connectionStatus}>
            <ThemedView style={[
              styles.statusIndicator, 
              { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }
            ]} />
            <ThemedText style={[
              styles.statusText,
              { color: isConnected ? '#4CAF50' : '#FF9800' }
            ]}>
              {isConnected ? 'Connected' : 'Tap to Connect'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };
  if (isWeb) {
      return <BleNotAvailablePage />;
    }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>BLE Connection</ThemedText>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: isScanning ? mutedColor : tintColor }]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            <Ionicons name={isScanning ? "refresh" : "bluetooth"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </ThemedView>

        {/* Status Card */}
        <ThemedView style={[styles.statusCard, { backgroundColor: cardColor, borderColor }]}>
          {/* ส่วนของ Bluetooth */}
          <ThemedView transparent style={styles.statusRow}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="bluetooth" size={24} color={tintColor} />
            </View>
            <View style={styles.statusTextContainer}>
              <ThemedText style={styles.statusTitle}>Bluetooth (Sensor)</ThemedText>
              <ThemedText style={styles.statusDescription}>
                 {isScanning ? "Scanning..." : (connectedDevice ? "Connected" : "Ready to scan")}
              </ThemedText>
            </View>
          </ThemedView>


          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* <ThemedView transparent style={styles.statusRow}>
            <View style={styles.statusIconContainer}>
              <Ionicons 
                name="cloud" 
                size={24} 
                color={isMqttConnected ? '#4CAF50' : '#FF9800'} 
              />
            </View>
            <View style={styles.statusTextContainer}>
              <ThemedText style={styles.statusTitle}>Cloud (HiveMQ)</ThemedText>
              <ThemedText style={[styles.statusDescription, { color: isMqttConnected ? '#4CAF50' : '#FF9800' }]}>
                 {isMqttConnected ? "Connected & Ready" : "Connecting..."}
              </ThemedText>
            </View>
          </ThemedView> */}
        </ThemedView>

        {/* Device List */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Devices Found ({foundDevices.length})
            </ThemedText>
            {isScanning && <ThemedText style={{color: tintColor}}>Scanning...</ThemedText>}
          </ThemedView>

          {foundDevices.length === 0 ? (
            <ThemedView style={[styles.emptyState, { backgroundColor: cardColor, borderColor }]}>
              <Ionicons name="bluetooth-outline" size={48} color={mutedColor} />
              <ThemedText type="muted" style={styles.emptyText}>
                No devices found. Press scan.
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={foundDevices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </ThemedView>

      </ScrollView>
    </SafeAreaView>
  );
};

export default BLEConnectionScreen;

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, marginBottom: 8 },
    headerTitle: { fontSize: 28, fontWeight: "700" },
    scanButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    statusCard: { borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1 },
    statusRow: { flexDirection: "row", alignItems: "center" },
    statusIconContainer: { width: 40, alignItems: "flex-start" },
    statusTextContainer: { flex: 1 },
    statusTitle: { fontSize: 16, fontWeight: "600" },
    statusDescription: { fontSize: 14, color: '#4CAF50', marginTop: 2 },
    divider: { height: 1, marginVertical: 16, opacity: 0.5 },
    statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "600" },
    deviceCard: { borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1 },
    deviceInfo: { gap: 12 },
    deviceHeader: { flexDirection: "row", alignItems: "center" },
    deviceDetails: { flex: 1, marginLeft: 12 },
    deviceName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
    deviceId: { fontSize: 12 },
    deviceStatus: { alignItems: "flex-end" },
    rssiText: { fontSize: 12, marginTop: 2 },
    connectionStatus: { flexDirection: "row", alignItems: "center" },
    statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 14, fontWeight: "500" },
    emptyState: { borderRadius: 12, padding: 32, alignItems: "center", borderWidth: 1, borderStyle: "dashed" },
    emptyText: { fontSize: 16, marginTop: 12 },
});