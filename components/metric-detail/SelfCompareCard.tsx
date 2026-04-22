import { ThemedText } from "@/components/themed-text";
import { SelfBar } from "@/hooks/use-metric-compare";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CompareRange } from "@/types/metric";
import { fmt } from "@/utils/format";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

/** Compact number: 12500 → "12.5k", 1200 → "1.2k", 950 → "950" */
function fmtCompact(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (unit === "%") return fmt(value, 1);
  if (value < 10) return fmt(value, 2);
  return fmt(value, 1);
}

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const RANGES: { key: CompareRange; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const SVG_H = 160;
const SVG_W = 300;
const Y_AXIS_W = 36;
const CARD_PAD = 18; // must match card padding below
const LABEL_H = 11;

interface Props {
  bars: SelfBar[];
  maxValue: number;
  unit: string;
  range: CompareRange;
  onRangeChange: (r: CompareRange) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const SelfCompareCard = ({
  bars,
  unit,
  range,
  onRangeChange,
  isLoading = false,
  error = null,
  onRetry,
}: Props) => {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const tintColor = useThemeColor({}, "tint");

  const normalizeValue = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    if (value < -50) {
      const restored = (100 - value) / 100;
      if (Number.isFinite(restored) && restored >= 0 && restored <= 100) return restored;
    }
    if (value < 0) return 0;
    return value;
  };

  const normalizedBars = bars.map((b) => ({ ...b, value: normalizeValue(b.value) }));
  const actualMin = normalizedBars.length > 0 ? Math.min(...normalizedBars.map((b) => b.value)) : 0;
  const actualMax = normalizedBars.length > 0 ? Math.max(...normalizedBars.map((b) => b.value)) : 1;
  const diff = actualMax - actualMin;
  const padding = diff === 0 ? Math.max(Math.abs(actualMin) * 0.1, 1) : diff * 0.5;
  const minValue = Math.max(0, actualMin - padding);
  const chartMax = actualMax + padding;
  const chartRange = Math.max(chartMax - minValue, 1);

  const latestBar = normalizedBars.find((b) => b.isLatest);
  const latestDisplay = latestBar ? fmtCompact(latestBar.value, unit) : null;

  const n = normalizedBars.length;

  // ── Y-axis labels at grid positions ───────────────────────────────────────
  // Y_AXIS_W is the label column width; CARD_PAD is the left inset within it
  const Y_AXIS_TOTAL = Y_AXIS_W + CARD_PAD; // total left column width when bleeding
  const yAxisLabels = [
    { value: chartMax,                    top: 0 },
    { value: minValue + chartRange * 0.5, top: SVG_H / 2 - LABEL_H / 2 },
    { value: minValue,                    top: SVG_H - LABEL_H },
  ];

  // ── X-axis label visibility (Apple Health sparse style) ───────────────────
  const showLabel = (i: number): boolean => {
    if (n <= 3) return true;
    if (range === "day") {
      return i === 0 || i === Math.floor((n - 1) / 2) || i === n - 1;
    }
    if (n <= 12) return true;
    const step = Math.ceil(n / 6);
    return i === 0 || i === n - 1 || i % step === 0;
  };

  // ── SVG line chart ─────────────────────────────────────────────────────────
  const colCx = (i: number) => ((i + 0.5) / n) * SVG_W;
  const toY = (value: number) =>
    SVG_H - Math.max((value - minValue) / chartRange, 0.02) * SVG_H;

  const svgPoints = normalizedBars.map((bar, i) => ({
    x: colCx(i),
    y: toY(bar.value),
    bar,
  }));

  const linePath = svgPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const areaPath =
    svgPoints.length > 1
      ? `${linePath} L${svgPoints[n - 1].x.toFixed(2)},${SVG_H} L${svgPoints[0].x.toFixed(2)},${SVG_H} Z`
      : "";

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <ThemedText style={styles.sectionTitle}>Your progress</ThemedText>
        {latestDisplay !== null && (
          <View style={styles.latestBadge}>
            <ThemedText style={[styles.latestValue, { color: tintColor }]} numberOfLines={1}>
              {latestDisplay}
            </ThemedText>
            <ThemedText style={[styles.latestUnit, { color: mutedColor }]}>
              {unit}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Segmented range control */}
      <View style={[styles.rangeControl, { backgroundColor: borderColor }]}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangeBtn, active && { backgroundColor: tintColor }]}
              onPress={() => onRangeChange(r.key)}
              activeOpacity={0.8}
              disabled={isLoading}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${r.label} range`}
            >
              <ThemedText
                style={[styles.rangeBtnText, { color: active ? "#fff" : mutedColor }]}
              >
                {r.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart body */}
      {isLoading ? (
        <View style={[styles.centerBox, { height: SVG_H + 24 }]}>
          <ActivityIndicator size="small" color={tintColor} />
          <ThemedText style={[styles.stateText, { color: mutedColor }]}>Loading…</ThemedText>
        </View>
      ) : error ? (
        <View style={[styles.centerBox, { height: SVG_H + 24 }]}>
          <ThemedText style={[styles.stateText, { color: mutedColor }]}>{error}</ThemedText>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              style={[styles.retryBtn, { borderColor: tintColor }]}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.retryText, { color: tintColor }]}>Retry</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : normalizedBars.length === 0 ? (
        <View style={[styles.centerBox, { height: SVG_H + 24 }]}>
          <ThemedText style={[styles.stateText, { color: mutedColor }]}>
            No data for this period
          </ThemedText>
        </View>
      ) : (
        <>
          {/* Y-axis + SVG — bleed to card edges */}
          <View style={styles.svgRow}>
            <View style={[styles.yAxis, { height: SVG_H }]}>
              {yAxisLabels.map(({ value, top }) => (
                <ThemedText
                  key={top}
                  style={[styles.yLabel, { color: mutedColor, top }]}
                  numberOfLines={1}
                >
                  {fmtCompact(value, unit)}
                </ThemedText>
              ))}
            </View>

            <View style={styles.svgWrap}>
              <Svg
                width="100%"
                height={SVG_H}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0.5, 1.0].map((frac) => (
                  <Line
                    key={frac}
                    x1={0}
                    y1={SVG_H * (1 - frac)}
                    x2={SVG_W}
                    y2={SVG_H * (1 - frac)}
                    stroke={borderColor}
                    strokeWidth={0.6}
                  />
                ))}

                {/* Area fill */}
                {areaPath ? (
                  <Path d={areaPath} fill={hexToRGBA(tintColor, 0.08)} />
                ) : null}

                {/* Line */}
                {linePath ? (
                  <Path
                    d={linePath}
                    fill="none"
                    stroke={tintColor}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}

                {/* Latest point dot */}
                {svgPoints.map((p, i) =>
                  p.bar.isLatest ? (
                    <Circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={5}
                      fill={tintColor}
                      stroke={cardColor}
                      strokeWidth={2.5}
                    />
                  ) : null
                )}
              </Svg>
            </View>
          </View>

          {/* X-axis labels — spacer matches bleed y-axis total width */}
          <View style={styles.axisRow}>
            <View style={{ width: Y_AXIS_TOTAL }} />
            {normalizedBars.map((bar, i) => (
              <View key={i} style={styles.axisCol}>
                {showLabel(i) && (
                  <>
                    <ThemedText
                      style={[
                        styles.axisValue,
                        {
                          color: bar.isLatest ? tintColor : mutedColor,
                          fontWeight: bar.isLatest ? "600" : "400",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {fmtCompact(bar.value, unit)}
                    </ThemedText>
                    <ThemedText
                      style={[styles.axisLabel, { color: mutedColor }]}
                      numberOfLines={1}
                    >
                      {bar.label}
                    </ThemedText>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={[styles.legendRow, { borderTopColor: borderColor }]}>
            <View style={[styles.legendDot, { backgroundColor: tintColor }]} />
            <ThemedText style={[styles.legendText, { color: mutedColor }]}>Latest</ThemedText>
            <View
              style={[styles.legendLine, { backgroundColor: hexToRGBA(tintColor, 0.5), marginLeft: 12 }]}
            />
            <ThemedText style={[styles.legendText, { color: mutedColor }]}>Trend</ThemedText>
            <ThemedText style={[styles.legendUnit, { color: mutedColor }]}>{unit}</ThemedText>
          </View>
        </>
      )}
    </View>
  );
};

export default SelfCompareCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: CARD_PAD,
    marginBottom: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  latestBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  latestValue: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  latestUnit: {
    fontSize: 12,
    fontWeight: "500",
  },
  rangeControl: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
    marginBottom: 18,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 13,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  svgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: -CARD_PAD, // bleed to card edges
  },
  yAxis: {
    width: Y_AXIS_W + CARD_PAD, // label column + left inset
    paddingLeft: CARD_PAD,
    position: "relative",
  },
  yLabel: {
    position: "absolute",
    right: 4,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
  },
  svgWrap: {
    flex: 1,
  },
  axisRow: {
    flexDirection: "row",
    marginTop: 6,
    marginHorizontal: -CARD_PAD, // align with bleed chart
    paddingHorizontal: CARD_PAD,
  },
  axisCol: {
    flex: 1,
    alignItems: "center",
  },
  axisValue: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  axisLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  legendText: { fontSize: 12 },
  legendUnit: {
    fontSize: 12,
    marginLeft: "auto",
  },
});
