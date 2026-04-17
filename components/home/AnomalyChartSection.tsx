import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
// Note: Ensure calculatePercentDiff is exported from your use-anomaly-data hook
import {
  AnomalyChartPoint,
  AnomalyScale,
  calculatePercentDiff,
} from "@/hooks/use-anomaly-data";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_MARGIN = 20;
const CARD_PADDING = 16;
const CHART_W = SCREEN_WIDTH - CARD_MARGIN * 2 - CARD_PADDING * 2;
const CHART_H = 140;
const PAD_Y = 16;
const PAD_X = 14;
const DOT_R = 3.5;

const RED = "#EF4444";
const RED_LINE = "rgba(239,68,68,0.55)";
const RED_DIM = "rgba(239,68,68,0.15)";

/**
 * Human-readable mapping for feature keys
 */
const FEATURE_LABELS: Record<string, string> = {
  max_gyr: "Leg Swing Speed",
  val_gyr: "Foot Landing Force",
  max_gyr_ms: "Leg Swing Speed",
  val_gyr_hs: "Foot Landing Force",
  swing_time: "In-Air Time",
  stance_time: "On-Ground Time",
  stride_cv: "Step Consistency",
};

/**
 * Mapping of backend feature keys to clinical disclaimers
 */
const ROOT_CAUSE_DISCLAIMERS: Record<string, string> = {
  max_gyr: "A slower swing often means dragging feet instead of lifting them.",
  val_gyr:
    "High values suggest landing too heavily on the foot due to weak muscles, low values suggest limping or favoring one side.",
  max_gyr_ms:
    "A slower swing often means dragging feet instead of lifting them.",
  val_gyr_hs:
    "High values suggest landing too heavily on the foot due to weak muscles, low values suggest limping or favoring one side.",
  swing_time:
    "A shorter time in the air often happens when dragging feet or taking small steps.",
  stance_time:
    "Spending more time on the ground suggests a cautious walk, a sudden drop can indicate pain.",
  stride_cv:
    "Higher percentages mean steps are less regular, which increases the risk of a fall.",
};

/**
 * Formats ISO timestamp to a readable English string
 */
function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Helper to get mapped label or fallback to formatted key
 */
function featureLabel(key: string): string {
  return (
    FEATURE_LABELS[key] ||
    key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/**
 * Determines label and color based on anomaly score threshold
 */
function severityInfo(score: number): { label: string; color: string } {
  if (score >= 0.9) return { label: "Critical", color: "#EF4444" };
  if (score >= 0.75) return { label: "High", color: "#F97316" };
  if (score >= 0.5) return { label: "Moderate", color: "#EAB308" };
  return { label: "Low", color: "#22C55E" };
}

const SCALES: AnomalyScale[] = ["day", "week", "month", "year"];

/**
 * Human-readable label for the current-period stat headline
 */
const SCALE_LABELS: Record<AnomalyScale, { period: string; sub: string }> = {
  day: { period: "Today", sub: "Anomalies Today" },
  week: { period: "This Week", sub: "Anomalies This Week" },
  month: { period: "This Month", sub: "Anomalies This Month" },
  year: { period: "This Year", sub: "Anomalies This Year" },
};

/**
 * Filter tabs for switching time scales
 */
const ScaleTabs: React.FC<{
  value: AnomalyScale;
  onChange: (s: AnomalyScale) => void;
  textColor: string;
}> = ({ value, onChange, textColor }) => (
  <View style={tabS.row}>
    {SCALES.map((s) => {
      const active = s === value;
      return (
        <TouchableOpacity
          key={s}
          onPress={() => onChange(s)}
          activeOpacity={0.7}
          style={[
            tabS.pill,
            active
              ? { backgroundColor: RED_DIM, borderColor: RED }
              : {
                  backgroundColor: "transparent",
                  borderColor: "rgba(128,128,128,0.25)",
                },
          ]}
        >
          <ThemedText
            style={[
              tabS.label,
              { color: active ? RED : textColor, opacity: active ? 1 : 0.5 },
            ]}
          >
            {s.toUpperCase()}
          </ThemedText>
        </TouchableOpacity>
      );
    })}
  </View>
);

const tabS = StyleSheet.create({
  row: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
});

/**
 * Custom SVG-like Line Chart using View components
 */
const LineChart: React.FC<{
  data: AnomalyChartPoint[];
  bgColor: string;
  onPress: (p: AnomalyChartPoint) => void;
}> = ({ data, bgColor, onPress }) => {
  const plotH = CHART_H - PAD_Y * 2;
  const drawW = CHART_W - PAD_X * 2;
  const max = Math.max(...data.map((d) => d.count), 1);

  const pts = data.map((d, i) => ({
    x: PAD_X + (data.length > 1 ? (i * drawW) / (data.length - 1) : drawW / 2),
    y: PAD_Y + (1 - d.count / max) * plotH,
    ...d,
  }));

  const segs = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x: a.x, y: a.y, len, ang };
  });

  const getFilteredIndices = () => {
    if (data.length <= 7) return data.map((_, i) => i);
    const step = Math.ceil(data.length / 6);
    const indices = [];
    for (let i = 0; i < data.length; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== data.length - 1) {
      indices.push(data.length - 1);
    }
    return indices;
  };

  const xIdx = getFilteredIndices();

  return (
    <View style={{ width: CHART_W }}>
      <View style={{ height: CHART_H, width: CHART_W }}>
        <View
          style={{
            position: "absolute",
            bottom: PAD_Y,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: "rgba(128,128,128,0.15)",
          }}
        />

        {segs.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y - 0.8,
              width: s.len,
              height: 1.6,
              backgroundColor: RED_LINE,
              borderRadius: 1,
              transformOrigin: "0 50%",
              transform: [{ rotate: `${s.ang}deg` }],
            }}
          />
        ))}

        {pts.map((p, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onPress(p)}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.7}
            style={{
              position: "absolute",
              left: p.x - (DOT_R + 2),
              top: p.y - (DOT_R + 2),
              width: (DOT_R + 2) * 2,
              height: (DOT_R + 2) * 2,
              borderRadius: DOT_R + 2,
              backgroundColor: bgColor,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <View
              style={{
                width: DOT_R * 2,
                height: DOT_R * 2,
                borderRadius: DOT_R,
                backgroundColor: RED,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 28, position: "relative", marginTop: 8 }}>
        {xIdx.map((idx) => {
          const p = pts[idx];
          if (!p) return null;
          return (
            <ThemedText
              key={idx}
              numberOfLines={1}
              style={{
                position: "absolute",
                left: p.x - 30,
                width: 60,
                textAlign: "center",
                fontSize: 8,
                fontWeight: "700",
                opacity: 0.4,
                letterSpacing: 0.2,
              }}
            >
              {data[idx]?.label?.toUpperCase()}
            </ThemedText>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Modal Bottom Sheet for detail log
 */
const AnomalyModal: React.FC<{
  visible: boolean;
  point: AnomalyChartPoint | null;
  onClose: () => void;
  sheetBg: string;
  tintColor: string;
}> = ({ visible, point, onClose, sheetBg, tintColor }) => {
  if (!point) return null;

  const featureCounts: Record<string, number> = {};
  for (const e of point.entries) {
    const f = e.root_cause_feature ?? "unknown";
    featureCounts[f] = (featureCounts[f] ?? 0) + 1;
  }
  const topFeatures = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]);

  const scored = point.entries.filter((e) => e.anomaly_score !== null);
  const avg = scored.length
    ? scored.reduce((s, e) => s + (e.anomaly_score ?? 0), 0) / scored.length
    : 0;
  const { label: sevL, color: sevC } = severityInfo(avg);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={ms.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[ms.sheet, { backgroundColor: sheetBg }]}>
          <View style={ms.handle} />

          <View style={ms.headerRow}>
            <ThemedText style={ms.title}>Anomalies · {point.label}</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ThemedText style={{ fontSize: 20, opacity: 0.3 }}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={ms.summaryRow}>
            <View style={[ms.badge, { backgroundColor: RED + "18" }]}>
              <ThemedText style={[ms.badgeNum, { color: RED }]}>
                {point.count}
              </ThemedText>
              <ThemedText style={ms.badgeSub}>ANOMALIES</ThemedText>
            </View>
            <View style={[ms.badge, { backgroundColor: sevC + "18" }]}>
              <ThemedText style={[ms.badgeNum, { color: sevC }]}>
                {sevL}
              </ThemedText>
              <ThemedText style={ms.badgeSub}>
                {scored.length > 0 ? `AVG ${avg.toFixed(2)}` : "NO SCORE"}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={ms.secLabel}>Root Causes</ThemedText>
          {topFeatures.map(([feat, cnt]) => (
            <View key={feat} style={ms.featRow}>
              <View style={ms.barBg}>
                <View
                  style={[
                    ms.barFill,
                    {
                      width: `${(cnt / point.count) * 100}%` as any,
                      backgroundColor: RED,
                    },
                  ]}
                />
              </View>
              <ThemedText style={ms.featName}>{featureLabel(feat)}</ThemedText>
              <ThemedText style={[ms.featCnt, { color: RED }]}>
                {cnt}
              </ThemedText>
            </View>
          ))}

          <ThemedText style={[ms.secLabel, { marginTop: 16 }]}>
            Recent Events
          </ThemedText>
          <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={false}
          >
            {[...point.entries]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime(),
              )
              .slice(0, 10)
              .map((e) => {
                const { label: sl, color: sc } = severityInfo(
                  e.anomaly_score ?? 0,
                );
                const disclaimer = e.root_cause_feature
                  ? ROOT_CAUSE_DISCLAIMERS[e.root_cause_feature]
                  : null;

                return (
                  <View key={e.anomaly_id} style={ms.entryCard}>
                    <View style={ms.entryTop}>
                      <ThemedText style={ms.entryFeat}>
                        {featureLabel(e.root_cause_feature ?? "unknown")}
                      </ThemedText>
                      <View style={[ms.dot, { backgroundColor: sc }]} />
                      <ThemedText style={[ms.sevTxt, { color: sc }]}>
                        {sl}
                      </ThemedText>
                    </View>
                    <ThemedText style={ms.entryTime}>
                      {formatTimestamp(e.timestamp)}
                    </ThemedText>

                    <View style={ms.metaRow}>
                      <ThemedText
                        style={[
                          ms.meta,
                          { color: RED, fontWeight: "700", opacity: 1 },
                        ]}
                      >
                        Difference:{" "}
                        {calculatePercentDiff(e.current_val, e.normal_ref)}
                      </ThemedText>
                    </View>

                    {disclaimer && (
                      <ThemedText style={ms.disclaimerText}>
                        {disclaimer}
                      </ThemedText>
                    )}
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.2)",
    alignSelf: "center",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  badge: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  badgeNum: { fontSize: 22, fontWeight: "800" },
  badgeSub: {
    fontSize: 10,
    opacity: 0.45,
    marginTop: 2,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  secLabel: {
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.4,
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  featRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.12)",
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  featName: { width: 150, fontSize: 12, opacity: 0.7 },
  featCnt: { fontSize: 13, fontWeight: "700", width: 22, textAlign: "right" },
  entryCard: {
    borderRadius: 10,
    backgroundColor: "rgba(128,128,128,0.06)",
    padding: 10,
    marginBottom: 7,
  },
  entryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  entryFeat: { fontSize: 13, fontWeight: "600", flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sevTxt: { fontSize: 11, fontWeight: "600" },
  entryTime: { fontSize: 11, opacity: 0.4, marginBottom: 4 },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  meta: { fontSize: 11, opacity: 0.5 },
  disclaimerText: {
    fontSize: 10,
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: 2,
    lineHeight: 14,
  },
});

interface AnomalyChartSectionProps {
  chartData: AnomalyChartPoint[];
  scale: AnomalyScale;
  onScaleChange: (s: AnomalyScale) => void;
  loading?: boolean;
}

export const AnomalyChartSection: React.FC<AnomalyChartSectionProps> = ({
  chartData,
  scale,
  onScaleChange,
  loading,
}) => {
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const [selected, setSelected] = useState<AnomalyChartPoint | null>(null);
  const [modal, setModal] = useState(false);

  const totalCount = chartData.reduce((sum, pt) => sum + pt.count, 0);
  const { sub: scaleSub } = SCALE_LABELS[scale];

  return (
    <View style={[card.wrap, { backgroundColor: cardColor }]}>
      <View style={card.statsRow}>
        <View>
          <ThemedText style={card.bigNum}>{totalCount}</ThemedText>
          <ThemedText style={[card.bigLabel, { color: textColor }]}>
            {scaleSub.toUpperCase()}
          </ThemedText>
        </View>
        <ScaleTabs
          value={scale}
          onChange={onScaleChange}
          textColor={textColor}
        />
      </View>

      {loading ? (
        <View style={card.empty}>
          <ThemedText type="muted" style={{ fontSize: 13 }}>
            Loading…
          </ThemedText>
        </View>
      ) : chartData.length === 0 ? (
        <View style={card.empty}>
          <ThemedText type="muted" style={{ fontSize: 13 }}>
            No data available.
          </ThemedText>
        </View>
      ) : (
        <View style={{ overflow: "visible" }}>
          <LineChart
            data={chartData}
            bgColor={cardColor}
            onPress={(p) => {
              setSelected(p);
              setModal(true);
            }}
          />
        </View>
      )}

      <AnomalyModal
        visible={modal}
        point={selected}
        onClose={() => setModal(false)}
        sheetBg={cardColor}
        tintColor={tintColor}
      />
    </View>
  );
};

const card = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    paddingHorizontal: CARD_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  bigNum: {
    fontSize: 42,
    fontWeight: "800",
    color: RED,
    lineHeight: 44,
    letterSpacing: -1,
  },
  bigLabel: {
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.4,
    letterSpacing: 1,
    marginTop: 2,
  },
  empty: { height: 80, justifyContent: "center", alignItems: "center" },
});
