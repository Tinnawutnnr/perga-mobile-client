import { patientApi } from "@/api/patient";
import { sessionApi } from "@/api/session";
import { CumulativeStatsCard } from "@/components/activity/CumulativeStatsCard";
import { WindowStatCard } from "@/components/activity/WindowStatCard";
import { useMqtt } from "@/hooks/use-mqtt";
import { useBleStore } from "@/store/ble-store";
import { WindowReport } from "@/types/metric";
import {
  createEmptySessionTotals,
  formatDuration,
} from "@/utils/activity-session";
import { tokenStorage } from "@/utils/token-storage";
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

const WINDOW_REPORT_INTERVAL_MS = 10_000;

const addAlphaToHex = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith("#")) return hex;
  const alphaInt = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  const alphaHex = alphaInt.toString(16).padStart(2, "0");
  return `${hex.slice(0, 7)}${alphaHex}`;
};

const ActivityScreen = () => {
  // ── Global BLE & MQTT state ──
  const connectedDevice = useBleStore((s) => s.connectedDevice);
  const pendingBatch = useBleStore((s) => s.pendingBatch);
  const startStreaming = useBleStore((s) => s.startStreaming);
  const stopStreaming = useBleStore((s) => s.stopStreaming);

  const {
    connectMqtt,
    disconnectMqtt,
    publishGaitData,
    isConnected: isMqttConnected,
  } = useMqtt();

  // ── Local recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForData, setIsWaitingForData] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [batchSentCount, setBatchSentCount] = useState(0);

  // ── Duration timer ──
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── WindowReport polling ──
  const [latestReport, setLatestReport] = useState<WindowReport | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionTotals, setSessionTotals] = useState(
    createEmptySessionTotals(),
  );

  // ── Theme colors ──
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  /**
   * API Polling Logic
   * Fetches latest window report and handles null/404 scenarios.
   */
  const fetchWindowData = async (isRecordingActive: boolean) => {
    try {
      const token = await tokenStorage.get();
      if (!token) return;

      const response = await patientApi.getWindowReport(token);

      // Check if response itself is null or undefined first
      if (!response) {
        return;
      }

      // Safe extraction of data (handles axios vs direct response)
      const report = (response as any).data || response;

      if (report) {
        setLatestReport(report);
        // Only accumulate if a recording session is actually active
        if (isRecordingActive) {
          setSessionTotals((prev) => ({
            steps: prev.steps + (report.steps ?? 0),
            distanceM: prev.distanceM + (report.distance_m ?? 0),
            kcal: prev.kcal + (report.calories ?? 0),
          }));
          setReportCount((c) => c + 1);
        }
      }
    } catch (error: any) {
      // Ignore 404 errors as they just mean "no data found for this user yet"
      if (error?.status === 404 || error?.response?.status === 404) return;
      console.error("Polling error:", error);
    }
  };

  const startPolling = useCallback(() => {
    stopPolling();
    fetchWindowData(true);
    pollRef.current = setInterval(
      () => fetchWindowData(true),
      WINDOW_REPORT_INTERVAL_MS,
    );
  }, []);

  // ── Lifecycle: Initial Setup ──
  useEffect(() => {
    connectMqtt().catch((err) =>
      console.error("MQTT Auto-connect failed:", err),
    );

    // Fetch initial data even before recording to show latest state from DB
    fetchWindowData(false);

    return () => {
      disconnectMqtt();
      stopTimer();
      stopPolling();
    };
  }, []);

  // ── Lifecycle: BLE to MQTT Bridge ──
  useEffect(() => {
    if (
      (isRecording || isWaitingForData) &&
      pendingBatch.length > 0 &&
      isMqttConnected
    ) {
      if (isWaitingForData) {
        setIsWaitingForData(false);
        setIsRecording(true);
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        startPolling();
      }
      publishGaitData(pendingBatch);
      setBatchSentCount((prev) => prev + 1);
    }
  }, [
    pendingBatch,
    isRecording,
    isWaitingForData,
    isMqttConnected,
    startPolling,
  ]);

  // ── UI Handlers ──
  const handleToggleActivity = async () => {
    if (!isRecording && !isWaitingForData) {
      if (!connectedDevice) {
        Alert.alert(
          "No Device",
          "Please connect to the wearable device first.",
        );
        return;
      }
      setSessionId(uuidv4());
      setBatchSentCount(0);
      setReportCount(0);
      setLatestReport(null);
      setSessionTotals(createEmptySessionTotals());
      setIsWaitingForData(true);
      try {
        if (!isMqttConnected) await connectMqtt();
        startStreaming();
      } catch (error) {
        console.error("Start streaming failed:", error);
        setIsWaitingForData(false);
      }
    } else {
      stopStreaming();
      stopTimer();
      stopPolling();
      setIsRecording(false);
      setIsWaitingForData(false);

      const token = await tokenStorage.get();
      if (token) {
        sessionApi
          .stopSession(token)
          .catch((err) => console.error("Session stop failed:", err));
      }

      Alert.alert(
        "Session Finished",
        `Gait session saved!\nDuration: ${formatDuration(elapsed)}\nBatches: ${batchSentCount}\nReports: ${reportCount}`,
      );
      setSessionId(null);
    }
  };

  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const mqttBadgeColor = isMqttConnected ? successColor : warningColor;
  const mqttBadgeBg = addAlphaToHex(mqttBadgeColor, 0.12);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.titleText}>
            Gait Analysis
          </ThemedText>
          <ThemedView style={[styles.badge, { backgroundColor: mqttBadgeBg }]}>
            <ThemedText style={[styles.badgeText, { color: mqttBadgeColor }]}>
              {isMqttConnected ? "MQTT Online" : "MQTT Offline"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.mainButton,
            {
              backgroundColor: isWaitingForData
                ? mutedColor
                : isRecording
                  ? "#FF5252"
                  : tintColor,
            },
          ]}
          onPress={handleToggleActivity}
          disabled={isWaitingForData}
        >
          {isWaitingForData ? (
            <ActivityIndicator
              size="small"
              color="#FFF"
              style={{ marginRight: 10 }}
            />
          ) : (
            <Ionicons
              name={isRecording ? "stop-circle" : "play-circle"}
              size={32}
              color="#FFF"
              style={{ marginRight: 10 }}
            />
          )}
          <ThemedText style={styles.buttonText}>
            {isWaitingForData
              ? "Waiting for Sensor..."
              : isRecording
                ? "Stop Activity"
                : "Start Tracking"}
          </ThemedText>
        </TouchableOpacity>

        {/* RECORDING STATUS CARD */}
        {isRecording && (
          <ThemedView
            style={[
              styles.statusCard,
              { backgroundColor: cardColor, borderColor: tintColor },
            ]}
          >
            <View style={styles.liveIndicator}>
              <Ionicons
                name={reportCount === 0 ? "hardware-chip-outline" : "recording"}
                size={28}
                color={tintColor}
              />
              <ThemedText style={[styles.liveText, { color: tintColor }]}>
                {reportCount === 0 ? "WAIT" : "LIVE"}
              </ThemedText>
            </View>
            <ThemedView transparent style={{ flex: 1 }}>
              {/* Check reportCount here */}
              <ThemedText style={[styles.recordingTitle, { color: tintColor }]}>
                {reportCount === 0 ? "Calibrating" : "Monitoring"}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 12 }}>
                ID: {sessionId?.split("-")[0]}...
              </ThemedText>
            </ThemedView>
            <ThemedView transparent style={{ alignItems: "flex-end" }}>
              <ThemedText style={[styles.timerText, { color: tintColor }]}>
                {formatDuration(elapsed)}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 10 }}>
                Duration
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* CUMULATIVE STATS CARD (Always visible) */}
        <CumulativeStatsCard
          totals={sessionTotals}
          tintColor={tintColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        {/* LATEST WINDOW CARD (Always visible) */}
        <WindowStatCard
          report={latestReport}
          cardColor={cardColor}
          borderColor={borderColor}
          tintColor={tintColor}
        />

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
  titleText: { fontSize: 24, fontWeight: "700" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  mainButton: {
    height: 65,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 4,
  },
  buttonText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderLeftWidth: 6,
  },
  liveIndicator: { marginRight: 15, alignItems: "center" },
  liveText: { fontSize: 10, marginTop: 4, fontWeight: "bold" },
  recordingTitle: { fontWeight: "700", fontSize: 16 },
  timerText: { fontSize: 24, fontWeight: "bold" },
});

export default ActivityScreen;
