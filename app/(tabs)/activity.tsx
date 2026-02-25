import { useMqtt } from "@/hooks/use-mqtt";
import { useBleStore } from "@/store/ble-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

const ActivityScreen = () => {
  // ── Global BLE state Zustand
  const connectedDevice = useBleStore((s) => s.connectedDevice);
  const lastBleData = useBleStore((s) => s.lastBleData);
  const pendingBatch = useBleStore((s) => s.pendingBatch);
  const startStreaming = useBleStore((s) => s.startStreaming);
  const stopStreaming = useBleStore((s) => s.stopStreaming);

  const {
    connectMqtt,
    disconnectMqtt,
    publishGaitData,
    isConnected: isMqttConnected,
  } = useMqtt();

  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [batchSentCount, setBatchSentCount] = useState(0);
  const isReady = connectedDevice || lastBleData;

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  // Disconnect MQTT if this screen unmounts while recording
  // Prevents stale setState calls on unmounted component.
  useEffect(() => {
    return () => {
      disconnectMqtt();
    };
  }, [disconnectMqtt]);

  useEffect(() => {
    if (
      isRecording &&
      pendingBatch.length > 0 &&
      isMqttConnected &&
      sessionId
    ) {
      publishGaitData("USER_ID", sessionId, pendingBatch);
      setBatchSentCount((prev) => {
        const nextCount = prev + 1;
        console.log(
          `Publish Batch No. ${nextCount} to HiveMQ (Session: ${sessionId})`,
        );
        return nextCount;
      });
    }
  }, [pendingBatch, isRecording, isMqttConnected, sessionId, publishGaitData]);

  const handleToggleActivity = async () => {
    if (!connectedDevice) {
      Alert.alert("No Device", "Please connect to ESP32 in the BLE tab first.");
      return;
    }

    if (!isRecording) {
      const newSid = uuidv4();
      setSessionId(newSid);
      setBatchSentCount(0);

      try {
        await connectMqtt();
        await startStreaming();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start activity:", error);
        Alert.alert(
          "Error",
          "Failed to start activity. Check your connection.",
        );
        setSessionId(null);
      }
    } else {
      stopStreaming();
      disconnectMqtt();
      setIsRecording(false);

      Alert.alert(
        "Success",
        `Gait session saved!\nTotal batches sent: ${batchSentCount}`,
      );
      setSessionId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={{ fontSize: 24, fontWeight: "700" }}>
            Gait Analysis
          </ThemedText>
          <ThemedView
            style={[
              styles.badge,
              { backgroundColor: isMqttConnected ? "#4CAF5020" : "#FF980020" },
            ]}
          >
            <ThemedText
              style={{
                color: isMqttConnected ? "#4CAF50" : "#FF9800",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {isMqttConnected ? "MQTT Online" : "MQTT Offline"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Live Preview Card */}
        <ThemedView
          style={[styles.card, { backgroundColor: cardColor, borderColor }]}
        >
          <ThemedText
            style={{ fontSize: 16, marginBottom: 10, color: mutedColor }}
          >
            Live Z-Axis Data (Gyro)
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 56,
              lineHeight: 68,
              fontWeight: "bold",
              textAlign: "center",
              marginVertical: 20,
              color: tintColor,
            }}
          >
            {lastBleData?.z?.toFixed(2) || "0.00"}
          </ThemedText>
          <ThemedText
            type="muted"
            style={{ textAlign: "center", fontSize: 12 }}
          >
            Connected to: {connectedDevice?.name || "None"}
          </ThemedText>
        </ThemedView>

        {/* Status Indicator */}
        {isRecording && (
          <ThemedView
            style={[
              styles.statusCard,
              { backgroundColor: cardColor, borderColor: tintColor },
            ]}
          >
            <View style={{ marginRight: 15, alignItems: "center" }}>
              <Ionicons name="recording" size={28} color={tintColor} />
              <ThemedText
                style={{
                  fontSize: 10,
                  color: tintColor,
                  marginTop: 4,
                  fontWeight: "bold",
                }}
              >
                LIVE
              </ThemedText>
            </View>
            <ThemedView transparent style={{ flex: 1 }}>
              <ThemedText
                style={{ fontWeight: "700", color: tintColor, fontSize: 16 }}
              >
                Recording in Progress
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 12, marginTop: 4 }}>
                ID: {sessionId?.split("-")[0]}...
              </ThemedText>
            </ThemedView>
            {/* 🚀 โชว์ตัวนับ Batch */}
            <ThemedView transparent style={{ alignItems: "flex-end" }}>
              <ThemedText
                style={{ fontSize: 24, fontWeight: "bold", color: tintColor }}
              >
                {batchSentCount}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 10 }}>
                Batches Sent
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* The Action Button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: isRecording ? "#FF5252" : tintColor },
            !isReady && { backgroundColor: mutedColor }, // ใช้ isReady แทน
          ]}
          onPress={handleToggleActivity}
          disabled={!isReady && !isRecording}
        >
          <Ionicons
            name={isRecording ? "stop-circle" : "play-circle"}
            size={32}
            color="#FFF"
            style={{ marginRight: 10 }}
          />
          <ThemedText
            style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}
          >
            {isRecording ? "Stop Activity" : "Start Tracking"}
          </ThemedText>
        </TouchableOpacity>

        {!isReady && !isRecording && (
          <ThemedText
            type="muted"
            style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}
          >
            Waiting for device connection...
          </ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderLeftWidth: 6,
  },
  mainButton: {
    height: 65,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default ActivityScreen;
