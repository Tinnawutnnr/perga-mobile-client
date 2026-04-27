import { AnomalyChartSection } from "@/components/home/AnomalyChartSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/fonts";
import { Colors } from "@/constants/theme";
import { calculatePercentDiff, useAnomalyData } from "@/hooks/use-anomaly-data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AnomalyLog } from "@/types/anomaly";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  max_gyr: "Leg Swing Speed",
  val_gyr: "Foot Landing Force",
  max_gyr_ms: "Leg Swing Speed",
  val_gyr_hs: "Foot Landing Force",
  swing_time: "In-Air Time",
  stance_time: "On-Ground Time",
  stride_cv: "Step Inconsistency",
};

const FEATURE_UNITS: Record<string, string> = {
  max_gyr: "rad/s",
  val_gyr: "rad/s",
  max_gyr_ms: "rad/s",
  val_gyr_hs: "rad/s",
  swing_time: "s",
  stance_time: "s",
  stride_cv: "%",
};

const ROOT_CAUSE_DISCLAIMERS: Record<string, string> = {
  max_gyr:
    "Too low often means the foot is barely leaving the ground. Too high can mean movement is jerky and harder to balance.",
  val_gyr:
    "Too close to zero can mean the person is guarding a painful foot. Very negative values can mean landing too hard and adding joint stress.",
  max_gyr_ms:
    "Too low often means the foot is barely leaving the ground. Too high can mean movement is jerky and harder to balance.",
  val_gyr_hs:
    "Too close to zero can mean the person is guarding a painful foot. Very negative values can mean landing too hard and adding joint stress.",
  swing_time:
    "Too short often means feet are sliding instead of lifting. Too long can make step timing uneven and affect balance.",
  stance_time:
    "Longer than usual can mean careful weight-bearing. Shorter than usual can mean rushed or unstable steps.",
  stride_cv:
    "Higher percentages mean step rhythm is uneven and fall risk is higher.",
};

function featureLabel(key: string): string {
  return (
    FEATURE_LABELS[key] ||
    key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

function featureUnit(key: string): string {
  return FEATURE_UNITS[key] ?? "";
}

function severityInfo(score: number): { label: string; color: string } {
  const magnitude = Math.abs(score);
  if (magnitude >= 3) return { label: "Critical", color: "#EF4444" };
  if (magnitude >= 1) return { label: "Moderate", color: "#F59E0B" };
  return { label: "Slight", color: "#22C55E" };
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatFullTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hexToRGBA(hex: string, alpha: number): string {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Detail sheet ─────────────────────────────────────────────────────────────

function DetailSheet({
  entry,
  onClose,
  sheetBg,
  mutedColor,
}: {
  entry: AnomalyLog | null;
  onClose: () => void;
  sheetBg: string;
  mutedColor: string;
}) {
  if (!entry) return null;

  const feat = entry.root_cause_feature ?? "unknown";
  const unit = featureUnit(feat);
  const { label: sevLabel, color: sevColor } = severityInfo(
    entry.anomaly_score ?? 0,
  );
  const pctChange = calculatePercentDiff(entry.current_val, entry.normal_ref);
  const disclaimer = ROOT_CAUSE_DISCLAIMERS[feat] ?? null;

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={ds.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[ds.sheet, { backgroundColor: sheetBg }]}>
          {/* Handle */}
          <View style={ds.handle} />

          {/* Header */}
          <View style={ds.header}>
            <View style={ds.headerLeft}>
              <View style={[ds.sevDot, { backgroundColor: sevColor }]} />
              <ThemedText style={ds.metricTitle}>
                {featureLabel(feat)}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={ds.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          <ThemedText style={[ds.timestamp, { color: mutedColor }]}>
            {formatFullTimestamp(entry.timestamp)}
          </ThemedText>

          {/* Severity + score */}
          <View
            style={[
              ds.severityRow,
              { backgroundColor: hexToRGBA(sevColor, 0.08) },
            ]}
          >
            <ThemedText style={[ds.sevLabel, { color: sevColor }]}>
              {sevLabel}
            </ThemedText>
            {entry.anomaly_score != null && (
              <ThemedText style={[ds.scoreText, { color: mutedColor }]}>
                Risk score: {entry.anomaly_score.toFixed(2)}
              </ThemedText>
            )}
          </View>

          {/* Stats row */}
          {(entry.current_val != null || entry.normal_ref != null) && (
            <View style={ds.statsRow}>
              <View style={ds.statCell}>
                <ThemedText style={[ds.statLabel, { color: mutedColor }]}>
                  Your value
                </ThemedText>
                <ThemedText style={ds.statValue}>
                  {entry.current_val != null
                    ? `${entry.current_val.toFixed(2)}${unit ? ` ${unit}` : ""}`
                    : "—"}
                </ThemedText>
              </View>
              <View style={[ds.statDivider, { backgroundColor: mutedColor }]} />
              <View style={ds.statCell}>
                <ThemedText style={[ds.statLabel, { color: mutedColor }]}>
                  Normal baseline
                </ThemedText>
                <ThemedText style={ds.statValue}>
                  {entry.normal_ref != null
                    ? `${entry.normal_ref.toFixed(2)}${unit ? ` ${unit}` : ""}`
                    : "—"}
                </ThemedText>
              </View>
              <View style={[ds.statDivider, { backgroundColor: mutedColor }]} />
              <View style={ds.statCell}>
                <ThemedText style={[ds.statLabel, { color: mutedColor }]}>
                  Change
                </ThemedText>
                <ThemedText style={[ds.statValue, { color: sevColor }]}>
                  {pctChange}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Clinical explanation */}
          {disclaimer && (
            <ThemedText style={[ds.disclaimer, { color: mutedColor }]}>
              {disclaimer}
            </ThemedText>
          )}
        </View>
      </View>
    </Modal>
  );
}

const ds = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.2)",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sevDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  timestamp: {
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 20,
  },
  severityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  sevLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 20,
  },
  statCell: {
    flex: 1,
    gap: 4,
    alignItems: "center",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    opacity: 0.25,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
  },
});

// ─── Event row ────────────────────────────────────────────────────────────────

function EventRow({
  entry,
  isRead,
  onPress,
  cardColor,
  mutedColor,
}: {
  entry: AnomalyLog;
  isRead: boolean;
  onPress: () => void;
  cardColor: string;
  mutedColor: string;
}) {
  const { label: sevLabel, color: sevColor } = severityInfo(
    entry.anomaly_score ?? 0,
  );
  const feat = entry.root_cause_feature ?? "unknown";
  const pctChange = calculatePercentDiff(entry.current_val, entry.normal_ref);
  const rowBg = isRead ? cardColor : hexToRGBA(sevColor, 0.07);

  return (
    <TouchableOpacity
      style={[styles.eventRow, { backgroundColor: rowBg }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${featureLabel(feat)}, ${sevLabel}, ${pctChange} vs normal. Tap to view details.`}
    >
      <View style={[styles.sevDot, { backgroundColor: sevColor }]} />

      <View style={styles.eventBody}>
        <View style={styles.eventTopRow}>
          <ThemedText style={styles.eventMetric} numberOfLines={1}>
            {featureLabel(feat)}
          </ThemedText>
          <ThemedText style={[styles.eventTime, { color: mutedColor }]}>
            {formatRelativeTime(entry.timestamp)}
          </ThemedText>
        </View>

        <View style={styles.eventMidRow}>
          <ThemedText style={[styles.eventChange, { color: sevColor }]}>
            {pctChange} vs normal
          </ThemedText>
          <ThemedText style={[styles.eventSev, { color: sevColor }]}>
            {sevLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.rowTrailing}>
        {!isRead && (
          <View style={[styles.unreadDot, { backgroundColor: sevColor }]} />
        )}
        <Ionicons name="chevron-forward" size={15} color={mutedColor} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const { chartData, rawEntries, scale, setScale, loading, error, refresh } =
    useAnomalyData();

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<AnomalyLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleRowPress = useCallback((entry: AnomalyLog) => {
    setReadIds((prev) => new Set(prev).add(entry.anomaly_id));
    setSelectedEntry(entry);
  }, []);

  const markAllRead = () => {
    setReadIds(new Set(rawEntries.map((e) => e.anomaly_id)));
  };

  const sortedEntries = useMemo(
    () =>
      [...rawEntries].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [rawEntries],
  );

  const todayEntries = sortedEntries.filter((e) => isToday(e.timestamp));
  const earlierEntries = sortedEntries.filter((e) => !isToday(e.timestamp));
  const unreadCount = sortedEntries.filter(
    (e) => !readIds.has(e.anomaly_id),
  ).length;

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.title}>Alerts</ThemedText>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: C.error }]}>
                  <ThemedText style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="muted" style={styles.subtitle}>
              Gait anomaly activity
            </ThemedText>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.markAllText, { color: tintColor }]}>
                Mark read
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {error && (
          <ThemedText style={[styles.errorText, { color: C.error }]}>
            {error}
          </ThemedText>
        )}

        {/* Chart */}
        <AnomalyChartSection
          chartData={chartData}
          scale={scale}
          onScaleChange={setScale}
          loading={loading}
        />

        {/* Chart tip */}
        {!loading && chartData.length > 0 && (
          <View style={[styles.chartTip, { backgroundColor: cardColor }]}>
            <Ionicons name="hand-left-outline" size={15} color={mutedColor} />
            <ThemedText style={[styles.chartTipText, { color: mutedColor }]}>
              Tap any point on the chart to see which metrics triggered the
              anomaly for that period.
            </ThemedText>
          </View>
        )}

        {loading && !rawEntries.length && (
          <ActivityIndicator
            color={tintColor}
            style={{ marginTop: 24, marginBottom: 8 }}
          />
        )}

        {/* Today */}
        {todayEntries.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Today</ThemedText>
            <View style={[styles.eventGroup, { backgroundColor: cardColor }]}>
              {todayEntries.map((entry, index) => (
                <View key={entry.anomaly_id}>
                  {index > 0 && (
                    <View
                      style={[styles.divider, { backgroundColor: C.border }]}
                    />
                  )}
                  <EventRow
                    entry={entry}
                    isRead={readIds.has(entry.anomaly_id)}
                    onPress={() => handleRowPress(entry)}
                    cardColor={cardColor}
                    mutedColor={mutedColor}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Earlier */}
        {earlierEntries.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Earlier</ThemedText>
            <View style={[styles.eventGroup, { backgroundColor: cardColor }]}>
              {earlierEntries.map((entry, index) => (
                <View key={entry.anomaly_id}>
                  {index > 0 && (
                    <View
                      style={[styles.divider, { backgroundColor: C.border }]}
                    />
                  )}
                  <EventRow
                    entry={entry}
                    isRead={readIds.has(entry.anomaly_id)}
                    onPress={() => handleRowPress(entry)}
                    cardColor={cardColor}
                    mutedColor={mutedColor}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty */}
        {!loading && rawEntries.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
            <Ionicons
              name="pulse-outline"
              size={40}
              color={tintColor}
              style={{ marginBottom: 14 }}
            />
            <ThemedText style={styles.emptyHeadline}>
              No anomalies recorded
            </ThemedText>
            <ThemedText style={[styles.emptyBody, { color: mutedColor }]}>
              Gait patterns are within normal range. Events will appear here
              when the system detects unusual movement activity.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Detail bottom sheet */}
      {selectedEntry && (
        <DetailSheet
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          sheetBg={cardColor}
          mutedColor={mutedColor}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 8,
  },
  headerLeft: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
    fontFamily: Fonts.heading,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontSize: 13, marginTop: 2 },
  markAllText: { fontSize: 13, fontWeight: "600" },

  errorText: { fontSize: 14, marginBottom: 12 },

  chartTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: -10,
    marginBottom: 24,
  },
  chartTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    opacity: 0.5,
    marginBottom: 8,
  },
  eventGroup: { borderRadius: 14, overflow: "hidden" },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 56,
  },
  sevDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  eventBody: { flex: 1, gap: 3 },
  eventTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  eventMetric: { fontSize: 14, fontWeight: "600", flex: 1 },
  eventTime: { fontSize: 12, flexShrink: 0 },
  eventMidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventChange: { fontSize: 13, fontWeight: "600" },
  eventSev: { fontSize: 12, fontWeight: "500", opacity: 0.85 },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  emptyState: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyHeadline: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
  },
});
