import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AnomalyChartPoint, AnomalyScale } from "@/hooks/use-anomaly-data";
import { AnomalyLog } from "@/types/anomaly";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_H = 160;
const CHART_PADDING_X = 16;
const CHART_PADDING_Y = 16;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function featureLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function severityLabel(score: number): { label: string; color: string } {
  if (score >= 0.9) return { label: "Critical", color: "#EF4444" };
  if (score >= 0.75) return { label: "High", color: "#F97316" };
  if (score >= 0.5) return { label: "Moderate", color: "#EAB308" };
  return { label: "Low", color: "#22C55E" };
}

// ─── Scale Tabs ───────────────────────────────────────────────────────────────

const SCALES: AnomalyScale[] = ["day", "week", "month", "year"];

interface ScaleTabsProps {
  value: AnomalyScale;
  onChange: (s: AnomalyScale) => void;
  tintColor: string;
  cardColor: string;
  textColor: string;
}

const ScaleTabs: React.FC<ScaleTabsProps> = ({
  value, onChange, tintColor, cardColor, textColor,
}) => (
  <View style={scaleStyles.row}>
    {SCALES.map((s) => {
      const active = s === value;
      return (
        <TouchableOpacity
          key={s}
          onPress={() => onChange(s)}
          style={[scaleStyles.pill, { backgroundColor: active ? tintColor : cardColor }]}
          activeOpacity={0.75}
        >
          <ThemedText style={[scaleStyles.label, { color: active ? "#fff" : textColor, opacity: active ? 1 : 0.55 }]}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </ThemedText>
        </TouchableOpacity>
      );
    })}
  </View>
);

const scaleStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  label: { fontSize: 12, fontWeight: "600" },
});

// ─── Pure-RN Line Chart (no SVG) ──────────────────────────────────────────────
//
// Draws line segments as absolutely-positioned Views rotated to connect each
// pair of data points. No external lib required.

interface LineChartProps {
  data: AnomalyChartPoint[];
  tintColor: string;
  cardColor: string;
  onPress: (point: AnomalyChartPoint) => void;
}

const LineChart: React.FC<LineChartProps> = ({ data, tintColor, cardColor, onPress }) => {
  const chartWidth = SCREEN_WIDTH - 40 - CHART_PADDING_X * 2; // account for card + inner padding
  const plotH = CHART_H - CHART_PADDING_Y * 2;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;

  const pts = data.map((d, i) => ({
    x: CHART_PADDING_X + i * stepX,
    y: CHART_PADDING_Y + (1 - d.count / maxCount) * plotH,
    ...d,
  }));

  // Build line segments between consecutive points
  const segments = pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { x: a.x, y: a.y, length, angle };
  });

  // X-axis indices (at most 5)
  const xIndices =
    data.length <= 5
      ? data.map((_, i) => i)
      : [0, Math.floor(data.length / 4), Math.floor(data.length / 2),
         Math.floor((data.length * 3) / 4), data.length - 1];

  return (
    <View style={{ marginTop: 8 }}>
      {/* Chart drawing area */}
      <View style={{ height: CHART_H, position: "relative" }}>

        {/* Horizontal grid lines */}
        {[1, 0.5, 0].map((ratio, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              top: CHART_PADDING_Y + (1 - ratio) * plotH,
              left: CHART_PADDING_X,
              right: CHART_PADDING_X,
              height: 1,
              backgroundColor: "rgba(128,128,128,0.12)",
            }}
          />
        ))}

        {/* Y-axis value labels */}
        {[maxCount, Math.round(maxCount / 2), 0].map((val, i) => (
          <ThemedText
            key={i}
            style={{
              position: "absolute",
              top: CHART_PADDING_Y + (1 - val / maxCount) * plotH - 8,
              left: 0,
              fontSize: 9,
              opacity: 0.35,
              width: CHART_PADDING_X - 2,
              textAlign: "right",
            }}
          >
            {val}
          </ThemedText>
        ))}

        {/* Area fill under the line — stacked vertical bars */}
        {pts.map((p, i) => {
          const barBottom = CHART_PADDING_Y + plotH;
          const barHeight = barBottom - p.y;
          if (i === pts.length - 1) return null; // skip last (handled by segments)
          const nextP = pts[i + 1];
          const barWidth = nextP.x - p.x;
          return (
            <View
              key={`area-${i}`}
              style={{
                position: "absolute",
                left: p.x,
                top: Math.min(p.y, nextP.y),
                width: barWidth,
                height: Math.max(p.y, nextP.y) - Math.min(p.y, nextP.y) + (barBottom - Math.max(p.y, nextP.y)),
                backgroundColor: tintColor,
                opacity: 0.07,
              }}
            />
          );
        })}

        {/* Line segments */}
        {segments.map((seg, i) => (
          <View
            key={`seg-${i}`}
            style={{
              position: "absolute",
              left: seg.x,
              top: seg.y - 1.25,
              width: seg.length,
              height: 2.5,
              backgroundColor: tintColor,
              borderRadius: 1.25,
              transformOrigin: "0 50%",
              transform: [{ rotate: `${seg.angle}deg` }],
            }}
          />
        ))}

        {/* Tap dots */}
        {pts.map((p, i) => (
          <TouchableOpacity
            key={`dot-${i}`}
            onPress={() => onPress(p)}
            hitSlop={{ top: 18, bottom: 18, left: 18, right: 18 }}
            style={{
              position: "absolute",
              left: p.x - 6,
              top: p.y - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: tintColor,
              borderWidth: 2,
              borderColor: cardColor,
            }}
          />
        ))}
      </View>

      {/* X-axis labels */}
      <View style={{ position: "relative", height: 16, marginTop: 4, marginHorizontal: CHART_PADDING_X }}>
        {xIndices.map((idx) => {
          const p = pts[idx];
          if (!p) return null;
          return (
            <ThemedText
              key={idx}
              style={{
                position: "absolute",
                left: p.x - CHART_PADDING_X - 20,
                width: 40,
                textAlign: "center",
                fontSize: 10,
                opacity: 0.45,
              }}
            >
              {data[idx]?.label}
            </ThemedText>
          );
        })}
      </View>
    </View>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface AnomalyModalProps {
  visible: boolean;
  point: AnomalyChartPoint | null;
  onClose: () => void;
  cardColor: string;
  tintColor: string;
}

const AnomalyModal: React.FC<AnomalyModalProps> = ({
  visible, point, onClose, cardColor, tintColor,
}) => {
  if (!point) return null;

  const featureCounts: Record<string, number> = {};
  for (const e of point.entries) {
    const feat = e.root_cause_feature ?? "unknown";
    featureCounts[feat] = (featureCounts[feat] ?? 0) + 1;
  }
  const topFeatures = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]);

  const scoredEntries = point.entries.filter((e) => e.anomaly_score !== null);
  const avgScore =
    scoredEntries.length > 0
      ? scoredEntries.reduce((s, e) => s + (e.anomaly_score ?? 0), 0) / scoredEntries.length
      : 0;
  const { label: sevLabel, color: sevColor } = severityLabel(avgScore);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={[modalStyles.sheet, { backgroundColor: cardColor }]}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.headerRow}>
            <ThemedText style={modalStyles.title}>Anomalies · {point.label}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={{ fontSize: 22, opacity: 0.5 }}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={modalStyles.summaryRow}>
            <View style={[modalStyles.badge, { backgroundColor: tintColor + "22" }]}>
              <ThemedText style={[modalStyles.badgeCount, { color: tintColor }]}>{point.count}</ThemedText>
              <ThemedText style={modalStyles.badgeSub}>anomalies</ThemedText>
            </View>
            <View style={[modalStyles.badge, { backgroundColor: sevColor + "22" }]}>
              <ThemedText style={[modalStyles.badgeCount, { color: sevColor }]}>{sevLabel}</ThemedText>
              <ThemedText style={modalStyles.badgeSub}>
                {avgScore > 0 ? `avg ${avgScore.toFixed(2)}` : "no score"}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={modalStyles.sectionLabel}>Top Root Causes</ThemedText>
          {topFeatures.map(([feat, cnt]) => (
            <View key={feat} style={modalStyles.featureRow}>
              <View style={modalStyles.featureBarBg}>
                <View
                  style={[modalStyles.featureBarFill, {
                    width: `${(cnt / point.count) * 100}%` as any,
                    backgroundColor: tintColor,
                  }]}
                />
              </View>
              <ThemedText style={modalStyles.featureName}>
                {feat !== "unknown" ? featureLabel(feat) : "Unknown"}
              </ThemedText>
              <ThemedText style={[modalStyles.featureCnt, { color: tintColor }]}>{cnt}</ThemedText>
            </View>
          ))}

          <ThemedText style={[modalStyles.sectionLabel, { marginTop: 16 }]}>Recent Events</ThemedText>
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {[...point.entries]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((entry) => {
                const score = entry.anomaly_score ?? 0;
                const { label: sl, color: sc } = severityLabel(score);
                return (
                  <View key={entry.anomaly_id} style={modalStyles.entryCard}>
                    <View style={modalStyles.entryTop}>
                      <ThemedText style={modalStyles.entryFeature}>
                        {entry.root_cause_feature
                          ? featureLabel(entry.root_cause_feature)
                          : "Unknown feature"}
                      </ThemedText>
                      <View style={[modalStyles.severityDot, { backgroundColor: sc }]} />
                      <ThemedText style={[modalStyles.severityTxt, { color: sc }]}>{sl}</ThemedText>
                    </View>
                    <ThemedText style={modalStyles.entryTime}>{formatTimestamp(entry.timestamp)}</ThemedText>
                    <View style={modalStyles.entryMetaRow}>
                      <ThemedText style={modalStyles.entryMeta}>Score: {entry.anomaly_score?.toFixed(3) ?? "—"}</ThemedText>
                      <ThemedText style={modalStyles.entryMeta}>Z: {entry.z_score?.toFixed(2) ?? "—"}</ThemedText>
                      <ThemedText style={modalStyles.entryMeta}>Val: {entry.current_val?.toFixed(2) ?? "—"}</ThemedText>
                      <ThemedText style={modalStyles.entryMeta}>Ref: {entry.normal_ref?.toFixed(2) ?? "—"}</ThemedText>
                    </View>
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, maxHeight: "85%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(128,128,128,0.3)", alignSelf: "center", marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  badge: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  badgeCount: { fontSize: 22, fontWeight: "700" },
  badgeSub: { fontSize: 11, opacity: 0.6, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "600", opacity: 0.5, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  featureBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(128,128,128,0.15)", overflow: "hidden" },
  featureBarFill: { height: 6, borderRadius: 3 },
  featureName: { width: 110, fontSize: 12 },
  featureCnt: { fontSize: 13, fontWeight: "700", width: 24, textAlign: "right" },
  entryCard: { borderRadius: 10, backgroundColor: "rgba(128,128,128,0.08)", padding: 10, marginBottom: 8 },
  entryTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  entryFeature: { fontSize: 13, fontWeight: "600", flex: 1 },
  severityDot: { width: 7, height: 7, borderRadius: 3.5 },
  severityTxt: { fontSize: 12, fontWeight: "600" },
  entryTime: { fontSize: 11, opacity: 0.5, marginBottom: 4 },
  entryMetaRow: { flexDirection: "row", gap: 10 },
  entryMeta: { fontSize: 11, opacity: 0.6 },
});

// ─── Exported Section ─────────────────────────────────────────────────────────

interface AnomalyChartSectionProps {
  chartData: AnomalyChartPoint[];
  scale: AnomalyScale;
  onScaleChange: (s: AnomalyScale) => void;
  loading?: boolean;
}

export const AnomalyChartSection: React.FC<AnomalyChartSectionProps> = ({
  chartData, scale, onScaleChange, loading,
}) => {
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  const [selectedPoint, setSelectedPoint] = useState<AnomalyChartPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePointPress = (point: AnomalyChartPoint) => {
    setSelectedPoint(point);
    setModalVisible(true);
  };

  const totalAnomalies = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <ThemedView style={[sectionStyles.card, { backgroundColor: cardColor }]}>
      <View style={sectionStyles.headerRow}>
        <View>
          <ThemedText style={sectionStyles.title}>Anomaly Activity</ThemedText>
          {!loading && (
            <ThemedText type="muted" style={sectionStyles.subtitle}>
              {totalAnomalies} total · tap a point for details
            </ThemedText>
          )}
        </View>
        <ScaleTabs
          value={scale}
          onChange={onScaleChange}
          tintColor={tintColor}
          cardColor={cardColor}
          textColor={textColor}
        />
      </View>

      {loading ? (
        <View style={sectionStyles.emptyBox}>
          <ThemedText type="muted" style={{ fontSize: 13 }}>Loading…</ThemedText>
        </View>
      ) : chartData.length === 0 ? (
        <View style={sectionStyles.emptyBox}>
          <ThemedText type="muted" style={{ fontSize: 13 }}>No anomaly data available.</ThemedText>
        </View>
      ) : (
        <LineChart
          data={chartData}
          tintColor={tintColor}
          cardColor={cardColor}
          onPress={handlePointPress}
        />
      )}

      <AnomalyModal
        visible={modalVisible}
        point={selectedPoint}
        onClose={() => setModalVisible(false)}
        cardColor={cardColor}
        tintColor={tintColor}
      />
    </ThemedView>
  );
};

const sectionStyles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 8 },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  emptyBox: { height: 80, justifyContent: "center", alignItems: "center" },
});