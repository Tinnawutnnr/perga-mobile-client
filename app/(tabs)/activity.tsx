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
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

const WINDOW_REPORT_INTERVAL_MS = 30_000;
const MOCK_PATIENT_ID = 1; // fallback for mock mode

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

  // `mockMode = true`  => skip BLE + MQTT and run only UI timers/polling
  // `mockMode = false` => require real BLE device and MQTT connection
  const [mockMode, setMockMode] = useState(false);

  const isReady = mockMode || connectedDevice || lastBleData;

  // ── Theme ──
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      disconnectMqtt();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [disconnectMqtt]);

  // ── Publish BLE batch while recording (real mode) ──
  useEffect(() => {
    if (
      isRecording &&
      !mockMode &&
      pendingBatch.length > 0 &&
      isMqttConnected &&
      sessionId
    ) {
      publishGaitData("USER_ID", sessionId, pendingBatch);
      setBatchSentCount((prev) => {
        const next = prev + 1;
        console.log(
          `Publish Batch No. ${next} to HiveMQ (Session: ${sessionId})`,
        );
        return next;
      });
    }
  }, [
    pendingBatch,
    isRecording,
    mockMode,
    isMqttConnected,
    sessionId,
    publishGaitData,
  ]);

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
  // This runs while recording: fetch once immediately, then every 30 seconds.
  const startPolling = useCallback(() => {
    setLatestReport(null);
    setReportCount(0);
    setSessionTotals(createEmptySessionTotals());

    const fetchReport = () => {
      // PLACE REAL API HERE:
      // Replace this block with your patient-specific call, for example:
      // const report = await activityApi.getLatestWindowReport(patientId, token)
      // Keep `setLatestReport(...)` and `setReportCount(...)` after the response.
      const report = generateMockWindowReport(MOCK_PATIENT_ID);
      setLatestReport(report);
      setSessionTotals((prev) => ({
        steps: prev.steps + report.steps,
        distanceM: prev.distanceM + report.distance_m,
        kcal: prev.kcal + report.calories,
      }));
      setReportCount((c) => c + 1);
    };

    // Fetch immediately, then every 30 s
    fetchReport();
    pollRef.current = setInterval(fetchReport, WINDOW_REPORT_INTERVAL_MS);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ── Main action handler ──
  const handleToggleActivity = async () => {
    if (!mockMode && !connectedDevice) {
      Alert.alert("No Device", "Please connect to ESP32 in the BLE tab first.");
      return;
    }

    if (!isRecording) {
      const newSid = uuidv4();
      setSessionId(newSid);
      setBatchSentCount(0);

      if (mockMode) {
        // Mock path: no device/mqtt dependency, useful for UI verification.
        setIsRecording(true);
        startTimer();
        startPolling();
        return;
      }

      try {
        await connectMqtt();
        startStreaming();
        setIsRecording(true);
        startTimer();
        startPolling();
      } catch (error) {
        console.error("Failed to start activity:", error);
        Alert.alert(
          "Error",
          "Failed to start activity. Check your connection.",
        );
        setSessionId(null);
      }
    } else {
      // Stop path: clear device/network resources only in real mode,
      // then always stop local timer + polling.
      if (!mockMode) {
        stopStreaming();
        disconnectMqtt();
      }
      stopTimer();
      stopPolling();
      setIsRecording(false);

      Alert.alert(
        "Success",
        `Gait session saved!\nDuration: ${formatDuration(elapsed)}\nTotal batches sent: ${mockMode ? "(mock)" : batchSentCount}\nReports received: ${reportCount}`,
      );
      setSessionTotals(createEmptySessionTotals());
      setLatestReport(null);
      setReportCount(0);
      setSessionId(null);
    }
  };

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
                backgroundColor:
                  mockMode || isMqttConnected ? "#4CAF5020" : "#FF980020",
              },
            ]}
          >
            <ThemedText
              style={{
                color: mockMode || isMqttConnected ? "#4CAF50" : "#FF9800",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {mockMode
                ? "MOCK MODE"
                : isMqttConnected
                  ? "MQTT Online"
                  : "MQTT Offline"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Mock-mode toggle */}
        <ThemedView
          style={[
            styles.card,
            {
              backgroundColor: cardColor,
              borderColor,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
            },
          ]}
        >
          <ThemedText style={{ fontSize: 14 }}>
            Dev Mock Mode (no BLE / MQTT)
          </ThemedText>
          <Switch
            value={mockMode}
            onValueChange={setMockMode}
            disabled={isRecording}
            trackColor={{ true: tintColor }}
          />
        </ThemedView>

        {/* Live Preview Card */}
        <ThemedView
          style={[styles.card, { backgroundColor: cardColor, borderColor }]}
        >
          <ThemedText
            style={{ fontSize: 16, marginBottom: 10, color: mutedColor }}
          >
            {mockMode ? "Mock Z-Axis Data" : "Live Z-Axis Data (Gyro)"}
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
            {mockMode
              ? (Math.random() * 4 - 2).toFixed(2)
              : lastBleData?.z?.toFixed(2) || "0.00"}
          </ThemedText>
          <ThemedText
            type="muted"
            style={{ textAlign: "center", fontSize: 12 }}
          >
            Connected to:{" "}
            {mockMode ? "Mock ESP32" : connectedDevice?.name || "None"}
          </ThemedText>
        </ThemedView>

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

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: isRecording ? "#FF5252" : tintColor },
            !isReady && { backgroundColor: mutedColor },
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
            {mockMode
              ? "Mock mode ready – press Start"
              : "Waiting for device connection..."}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default ActivityScreen;
