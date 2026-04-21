import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { WindowReport } from "@/types/metric";
import { healthLabel, modelStatusLabel } from "@/utils/activity-session";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex))
    return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const val = (value: number | null | undefined, unit = "") => {
  if (value == null) return "–";
  return `${parseFloat(value.toFixed(2))}${unit}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  report: WindowReport | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const WindowStatCard: React.FC<Props> = ({ report }) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  // Health → theme color mapping
  const normalized = (report?.gait_health ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const healthColor =
    normalized === "healthy" || normalized === "normal"
      ? C.success
      : normalized === "anomaly_detected" || normalized === "anomaly"
        ? C.error
        : C.warning;

  // Anomaly score (0–1), clamped
  const anomalyScore = Math.min(Math.max(report?.anomaly_score ?? 0, 0), 1);
  const scoreColor =
    anomalyScore < 0.25 ? C.success : anomalyScore < 0.4 ? C.warning : C.error;

  const statRows = [
    { label: "Swing velocity", value: val(report?.max_gyr_ms, " deg/s") },
    { label: "Impact intensity", value: val(report?.val_gyr_hs, " deg/s") },
    { label: "Swing time", value: val(report?.swing_time, " s") },
    { label: "Stance time", value: val(report?.stance_time, " s") },
    { label: "Stride variability", value: val(report?.stride_cv, "%") },
  ];

  const timestamp = report?.timestamp
    ? new Date(report.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={[styles.sectionLabel, { color: C.muted }]}>
            GAIT WINDOW
          </ThemedText>
          <ThemedText style={[styles.statusText, { color: C.muted }]}>
            {modelStatusLabel(report?.status ?? null)}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          {report ? (
            <View
              style={[
                styles.healthBadge,
                { backgroundColor: hexToRGBA(healthColor, 0.1) },
              ]}
            >
              <View
                style={[styles.healthDot, { backgroundColor: healthColor }]}
              />
              <ThemedText
                style={[styles.healthText, { color: healthColor }]}
              >
                {healthLabel(report.gait_health)}
              </ThemedText>
            </View>
          ) : null}
          {timestamp && (
            <ThemedText style={[styles.timestamp, { color: C.muted }]}>
              {timestamp}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Anomaly score track */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreRow}>
          <ThemedText style={[styles.scoreLabel, { color: C.muted }]}>
            Anomaly risk
          </ThemedText>
          <ThemedText style={[styles.scoreValue, { color: scoreColor }]}>
            {report?.anomaly_score != null
              ? report.anomaly_score.toFixed(2)
              : "–"}
          </ThemedText>
        </View>
        {/* Flex-ratio track — no string percentage needed */}
        <View
          style={[
            styles.scoreTrack,
            { backgroundColor: hexToRGBA(borderColor, 0.8) },
          ]}
        >
          <View
            style={[
              styles.scoreFill,
              {
                flex: anomalyScore > 0 ? anomalyScore : 0.001,
                backgroundColor: scoreColor,
              },
            ]}
          />
          <View style={{ flex: Math.max(1 - anomalyScore, 0) }} />
        </View>
      </View>

      {/* Stat rows */}
      {statRows.map((row, i) => (
        <View key={i}>
          <View style={[styles.hairline, { backgroundColor: borderColor }]} />
          <View style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: C.muted }]}>
              {row.label}
            </ThemedText>
            <ThemedText style={styles.statValue}>{row.value}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Score track
  scoreSection: {
    marginBottom: 4,
    gap: 8,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  scoreTrack: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  scoreFill: {
    borderRadius: 2,
  },
  // Stat rows
  hairline: {
    height: StyleSheet.hairlineWidth,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
