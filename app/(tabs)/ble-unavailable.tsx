import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// todo ble-connection.web

export default function BleNotAvailablePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Not Available</Text>
      <Text style={styles.message}>
        Bluetooth Low Energy (BLE) is not available on web platform.
      </Text>
      <Text style={styles.subtitle}>
        Please use this app on a mobile device (iOS or Android) to use BLE features.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});