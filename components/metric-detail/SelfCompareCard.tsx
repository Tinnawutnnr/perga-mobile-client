import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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

const RANGES: { key: CompareRange; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

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
  maxValue,
  unit,
  range,
  onRangeChange,
  isLoading = false,
  error = null,
  onRetry,
}: Props) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const normalizeValue = (value: number) => {
    if (!Number.isFinite(value)) return 0;

    // Backward-compatible guard for legacy transformed CV values
    // stored as `100 - (cv * 100)`, which produces large negatives.
    if (value < -50) {
      const restored = (100 - value) / 100;
      if (Number.isFinite(restored) && restored >= 0 && restored <= 100) {
        return restored;
      }
    }

    // All self-compare metrics are non-negative in this app.
    if (value < 0) return 0;

    return value;
  };
  const normalizedBars = bars.map((b) => ({
    ...b,
    value: normalizeValue(b.value),
  }));

  const actualMin =
    normalizedBars.length > 0
      ? Math.min(...normalizedBars.map((b) => b.value))
      : 0;
  const actualMax =
    normalizedBars.length > 0
      ? Math.max(...normalizedBars.map((b) => b.value))
      : 1;

  const diff = actualMax - actualMin;
  const padding =
    diff === 0 ? Math.max(Math.abs(actualMin) * 0.1, 1) : diff * 0.5;

  const minValue = Math.max(0, actualMin - padding);
  const chartMax = actualMax + padding;
  const chartRange = Math.max(chartMax - minValue, 1);

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Your Progress
      </ThemedText>

      {/* ── Range selector ── */}
      <View style={[styles.rangeSelector, { borderColor }]}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangeBtn, active && styles.rangeBtnActive]}
              onPress={() => onRangeChange(r.key)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <ThemedText
                style={[
                  styles.rangeBtnText,
                  { color: active ? "#fff" : mutedColor },
                ]}
              >
                {r.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Body: loading / error / chart ── */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color="#5D7DDF" />
          <ThemedText style={[styles.statusText, { color: mutedColor }]}>
            Loading…
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <ThemedText style={[styles.statusText, { color: "#FF6B6B" }]}>
            {error}
          </ThemedText>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : normalizedBars.length === 0 ? (
        <View style={styles.centerBox}>
          <ThemedText style={[styles.statusText, { color: mutedColor }]}>
            No data available
          </ThemedText>
        </View>
      ) : (
        <>
          {/* ── Bar chart ── */}
          <View style={styles.chartWrap}>
            {normalizedBars.map((bar, index) => {
              const heightPct = Math.max(
                Math.round(((bar.value - minValue) / chartRange) * 100),
                5,
              );

              const displayValue =
                unit === "%"
                  ? Number(fmt(bar.value, 1))
                  : Number(fmt(bar.value, 2));
              return (
                <View key={index} style={styles.barCol}>
                  <ThemedText
                    style={[styles.valueLabel, { color: mutedColor }]}
                  >
                    {displayValue}
                  </ThemedText>
                  <View
                    style={[styles.barTrack, { backgroundColor: borderColor }]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: bar.isLatest ? "#5D7DDF" : "#3A4A77",
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.barLabel, { color: mutedColor }]}>
                    {bar.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {/* ── Legend ── */}
          <View style={[styles.legendRow, { borderTopColor: borderColor }]}>
            <View style={[styles.dot, { backgroundColor: "#5D7DDF" }]} />
            <ThemedText style={[styles.legendText, { color: mutedColor }]}>
              Latest ({unit})
            </ThemedText>
            <View
              style={[
                styles.dot,
                { backgroundColor: "#3A4A77", marginLeft: 12 },
              ]}
            />
            <ThemedText style={[styles.legendText, { color: mutedColor }]}>
              Previous ({unit})
            </ThemedText>
          </View>
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },

  rangeSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  rangeBtn: { flex: 1, paddingVertical: 7, alignItems: "center" },
  rangeBtnActive: { backgroundColor: "#5D7DDF" },
  rangeBtnText: { fontSize: 13, fontWeight: "600" },

  centerBox: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statusText: { fontSize: 13, textAlign: "center" },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#5D7DDF",
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  valueLabel: { fontSize: 10, marginBottom: 3 },
  barTrack: {
    width: "100%",
    height: 130,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 11, marginTop: 4 },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
});

export default SelfCompareCard;
