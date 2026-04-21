import { patientApi } from "@/api/patient";
import { sessionApi } from "@/api/session";
import { CumulativeStatsCard } from "@/components/activity/CumulativeStatsCard";
import { WindowStatCard } from "@/components/activity/WindowStatCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMqtt } from "@/hooks/use-mqtt";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useBleStore } from "@/store/ble-store";
import { WindowReport } from "@/types/metric";
import {
  createEmptySessionTotals,
  formatDuration,
} from "@/utils/activity-session";
import { toast } from "@/store/toast-store";
import { tokenStorage } from "@/utils/token-storage";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";
import { ThemedText } from "../../components/themed-text";

const WINDOW_REPORT_INTERVAL_MS = 10_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex))
    return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Pulse dot (recording indicator) ─────────────────────────────────────────

function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

// ─── Waiting dots (initializing indicator) ───────────────────────────────────

function WaitingDots({ color }: { color: string }) {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makePulse = (dot: Animated.Value) =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 280,
          useNativeDriver: true,
        }),
      ]);
    const anim = Animated.loop(
      Animated.stagger(180, [makePulse(d1), makePulse(d2), makePulse(d3)]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
      {[d1, d2, d3].map((d, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            opacity: d,
          }}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const ActivityScreen = () => {
  // ── Global BLE & MQTT state ──────────────────────────────────────────────
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

  // ── Local recording state ─────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isWaitingForData, setIsWaitingForData] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [batchSentCount, setBatchSentCount] = useState(0);

  // ── Duration timer ────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── WindowReport polling ──────────────────────────────────────────────────
  const [latestReport, setLatestReport] = useState<WindowReport | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionTotals, setSessionTotals] = useState(
    createEmptySessionTotals(),
  );

  // ── Theme ─────────────────────────────────────────────────────────────────
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");

  // ── Timer helpers ─────────────────────────────────────────────────────────

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

  const fetchWindowData = async (isRecordingActive: boolean) => {
    try {
      const token = await tokenStorage.get();
      if (!token) return;
      const response = await patientApi.getWindowReport(token);
      if (!response) return;
      const report = (response as any).data || response;
      if (report) {
        setLatestReport(report);
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

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    connectMqtt().catch((err) =>
      console.error("MQTT Auto-connect failed:", err),
    );
    fetchWindowData(false);
    return () => {
      disconnectMqtt();
      stopTimer();
      stopPolling();
    };
  }, []);

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
  }, [pendingBatch, isRecording, isWaitingForData, isMqttConnected, startPolling]);

  // ── UI Handlers ───────────────────────────────────────────────────────────

  const handleToggleActivity = async () => {
    if (!isRecording && !isWaitingForData) {
      if (!connectedDevice) {
        toast.warning("Connect your gait sensor first");
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

      toast.success(`Session saved · ${formatDuration(elapsed)}`);
      setSessionId(null);
    }
  };

  // ── Derived UI state ──────────────────────────────────────────────────────

  const mqttColor = isMqttConnected ? successColor : warningColor;
  const timerColor = isRecording ? tintColor : mutedColor;

  const recordingStatus =
    isRecording && reportCount === 0
      ? "Calibrating"
      : isRecording
        ? "Monitoring"
        : null;

  const buttonBg = isWaitingForData
    ? mutedColor
    : isRecording
      ? C.error
      : tintColor;

  const buttonLabel = isWaitingForData
    ? "Initializing…"
    : isRecording
      ? "Stop recording"
      : "Start tracking";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 48,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Activity</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Gait recording
            </ThemedText>
          </View>
          {/* MQTT status badge */}
          <View
            style={[
              styles.mqttBadge,
              { backgroundColor: hexToRGBA(mqttColor, 0.1) },
            ]}
          >
            <View
              style={[styles.mqttDot, { backgroundColor: mqttColor }]}
            />
            <ThemedText style={[styles.mqttText, { color: mqttColor }]}>
              {isMqttConnected ? "Online" : "Offline"}
            </ThemedText>
          </View>
        </View>

        {/* No device notice */}
        {!connectedDevice && !isRecording && (
          <View
            style={[
              styles.deviceNotice,
              { backgroundColor: hexToRGBA(C.warning, 0.08) },
            ]}
          >
            <Ionicons
              name="watch-outline"
              size={15}
              color={C.warning}
            />
            <ThemedText
              style={[styles.deviceNoticeText, { color: C.warning }]}
            >
              Connect your gait sensor before starting
            </ThemedText>
          </View>
        )}

        {/* Timer block */}
        <View style={styles.timerBlock}>
          <ThemedText
            style={[styles.timerValue, { color: timerColor }]}
          >
            {formatDuration(elapsed)}
          </ThemedText>

          <View style={styles.timerStatus}>
            {isWaitingForData ? (
              <>
                <WaitingDots color={mutedColor} />
                <ThemedText style={[styles.timerLabel, { color: mutedColor }]}>
                  Calibrating sensor
                </ThemedText>
              </>
            ) : isRecording ? (
              <>
                <PulseDot color={tintColor} />
                <ThemedText
                  style={[styles.timerLabel, { color: mutedColor }]}
                >
                  {recordingStatus}
                  {reportCount > 0 ? ` · ${reportCount} window${reportCount !== 1 ? "s" : ""}` : ""}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.timerLabel, { color: mutedColor }]}>
                Ready to start
              </ThemedText>
            )}
          </View>
        </View>

        {/* Start / Stop button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: buttonBg }]}
          onPress={handleToggleActivity}
          disabled={isWaitingForData}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
        >
          <ThemedText style={styles.actionButtonLabel}>
            {buttonLabel}
          </ThemedText>
        </TouchableOpacity>

        {/* Session ID — subtle, only when recording */}
        {sessionId && isRecording && (
          <ThemedText
            style={[styles.sessionId, { color: C.muted }]}
            numberOfLines={1}
          >
            Session {sessionId.split("-")[0]}
          </ThemedText>
        )}

        {/* Cumulative stats */}
        <CumulativeStatsCard totals={sessionTotals} />

        {/* Per-window stats */}
        <WindowStatCard report={latestReport} />
      </ScrollView>
    </View>
  );
};

export default ActivityScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  mqttBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mqttDot: { width: 6, height: 6, borderRadius: 3 },
  mqttText: { fontSize: 12, fontWeight: "600" },

  // Device notice
  deviceNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },
  deviceNoticeText: { fontSize: 13, fontWeight: "500" },

  // Timer
  timerBlock: {
    marginBottom: 24,
    gap: 10,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -2,
    lineHeight: 60,
    fontVariant: ["tabular-nums"],
  },
  timerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Action button
  actionButton: {
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionButtonLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },

  // Session ID
  sessionId: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
});
