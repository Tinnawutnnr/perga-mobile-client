import { CumulativeStatsCard } from "@/components/activity/CumulativeStatsCard";
import { WindowStatCard } from "@/components/activity/WindowStatCard";
import { useMqtt } from "@/hooks/use-mqtt";
import { useBleStore } from "@/store/ble-store";
import { WindowReport } from "@/types/metric";
import {
  createEmptySessionTotals,
  formatDuration,
  generateMockWindowReport,
} from "@/utils/activity-session";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

const WINDOW_REPORT_INTERVAL_MS = 30_000;
const MOCK_PATIENT_ID = 1; // temporary until window report API is available

const addAlphaToHex = (hex: string, alpha: number) => {
  // If the color is not a 6- or 8-digit hex, return it unchanged.
  if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 9)) {
    return hex;
  }

  const alphaInt = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  const alphaHex = alphaInt.toString(16).padStart(2, "0");

  // If hex already has alpha, replace it; otherwise, append it.
  return hex.length === 7 ? `${hex}${alphaHex}` : `${hex.slice(0, 7)}${alphaHex}`;
};
const USER_ID = "USER_ID";

const ActivityScreen = () => {
  // ── Global BLE state (Zustand) ──
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

  // ── Local state ──
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForData, setIsWaitingForData] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [batchSentCount, setBatchSentCount] = useState(0);

  // Duration timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // WindowReport polling
  const [latestReport, setLatestReport] = useState<WindowReport | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionTotals, setSessionTotals] = useState(createEmptySessionTotals);

  // ── Theme ──
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

    // ── Start / stop duration timer ──
  const startTimer = useCallback(() => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Start / stop WindowReport polling ──
  const startPolling = useCallback(() => {
    setLatestReport(null);
    setReportCount(0);
    setSessionTotals(createEmptySessionTotals());

    const fetchReport = () => {
      const report = generateMockWindowReport(MOCK_PATIENT_ID);
      setLatestReport(report);
      setSessionTotals((prev) => ({
        steps: prev.steps + report.steps,
        distanceM: prev.distanceM + report.distance_m,
        kcal: prev.kcal + report.calories,
      }));
      setReportCount((c) => c + 1);
    };

    fetchReport();
    pollRef.current = setInterval(fetchReport, WINDOW_REPORT_INTERVAL_MS);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ── Auto-Connect MQTT & Cleanup on unmount ──
  useEffect(() => {
    connectMqtt().catch((error) => {
      console.error("Failed to auto-connect MQTT:", error);
    });

    return () => {
      disconnectMqtt();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Publish BLE batch & Catch First Batch ──
  useEffect(() => {
    if ((isRecording || isWaitingForData) && pendingBatch.length > 0 && isMqttConnected) {
      
      if (isWaitingForData) {
        setIsWaitingForData(false);
        setIsRecording(true);
        startTimer();
        startPolling();
      }

      publishGaitData(USER_ID, pendingBatch);
      // setBatchSentCount((prev) => {
      //   const next = prev + 1;
      //   return next;
      // });
    }
  }, [
    pendingBatch,
    isRecording,
    isWaitingForData,
    isMqttConnected,
  ]);

  // ── Main action handler ──
  const handleToggleActivity = async () => {
    if (!isRecording && !isWaitingForData) {
      if (!connectedDevice) {
        Alert.alert("No Device", "Please connect to ESP32 in the BLE tab first.");
        return;
      }

      const newSid = uuidv4();
      setSessionId(newSid);
      setBatchSentCount(0);
      setIsWaitingForData(true);

      try {
        startStreaming();
      } catch (error) {
        console.error("Failed to start BLE streaming:", error);
        setIsWaitingForData(false);
      }
    } else {
      // Stop path: clear device/network resources, then stop timer + polling.
      console.log("Stopping activity...");
      stopStreaming();
      await new Promise(resolve => setTimeout(resolve, 100));
      stopTimer();
      stopPolling();
      setIsRecording(false);
      setIsWaitingForData(false);
      
      // system alert
      Alert.alert(
        "Success",
        `Gait session saved!\nDuration: ${formatDuration(elapsed)}\nTotal batches sent: ${batchSentCount}\nReports received: ${reportCount}`,
      );
      setSessionTotals(createEmptySessionTotals());
      setLatestReport(null);
      setReportCount(0);
      setSessionId(null);
    }
  };

  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const mqttBadgeTextColor = isMqttConnected ? successColor : warningColor;
  const mqttBadgeBackgroundColor = addAlphaToHex(
    isMqttConnected ? successColor : warningColor,
    0.125 // Approximate previous 0x20 alpha (~12.5%)
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={{ fontSize: 24, fontWeight: "700" }}>
            Gait Analysis
          </ThemedText>
          <ThemedView
            style={[
              styles.badge,
              {
                backgroundColor: mqttBadgeBackgroundColor,
              },
            ]}
          >
            <ThemedText
              style={{
                color: mqttBadgeTextColor,
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

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: isWaitingForData ? mutedColor : tintColor,
            },
          ]}
          onPress={handleToggleActivity}
          disabled={isWaitingForData}
        >
          {isWaitingForData ? (
            <ActivityIndicator
              size="small"
              color={mutedColor}
              style={{ marginRight: 10 }}
            />
          ) : (
            <Ionicons
              name={isRecording ? "stop-circle" : "play-circle"}
              size={32}
              color={mutedColor}
              style={{ marginRight: 10 }}
            />
          )}
          <ThemedText
            style={{ color: mutedColor, fontSize: 20, fontWeight: "bold" }}
          >
            {isWaitingForData
              ? "Waiting for Sensor..."
              : isRecording
                ? "Stop Activity"
                : "Start Tracking"}
          </ThemedText>
        </TouchableOpacity>

        {/* Duration + Status Card */}
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
            {/* Duration counter */}
            <ThemedView transparent style={{ alignItems: "flex-end" }}>
              <ThemedText
                style={{ fontSize: 24, fontWeight: "bold", color: tintColor }}
              >
                {formatDuration(elapsed)}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 10 }}>
                Duration
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Session cumulative totals (reset after stop) */}
        {isRecording && (
          <CumulativeStatsCard
            totals={sessionTotals}
            tintColor={tintColor}
            cardColor={cardColor}
            borderColor={borderColor}
          />
        )}

        {/* Latest WindowReport card */}
        {isRecording && latestReport && (
          <WindowStatCard
            report={latestReport}
            cardColor={cardColor}
            borderColor={borderColor}
            tintColor={tintColor}
          />
        )}

        {!connectedDevice && !isRecording && (
          <ThemedText
            type="muted"
            style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}
          >
            No BLE device connected. Please connect to ESP32 in the BLE tab first.
          </ThemedText>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
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
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default ActivityScreen;
