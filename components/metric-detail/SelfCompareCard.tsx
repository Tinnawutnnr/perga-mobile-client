import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SelfBar } from "@/hooks/use-metric-compare";
import { CompareRange } from "@/types/metric";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

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
}

const SelfCompareCard = ({ bars, maxValue, unit, range, onRangeChange }: Props) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Your Progress
      </ThemedText>

      {/* Range selector */}
      <View style={[styles.rangeSelector, { borderColor }]}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.rangeBtn, active && styles.rangeBtnActive]}
              onPress={() => onRangeChange(r.key)}
              activeOpacity={0.7}
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

      {/* Bar chart */}
      <View style={styles.chartWrap}>
        {bars.map((bar, index) => {
          const heightPct = Math.round((bar.value / maxValue) * 100);
          return (
            <View key={index} style={styles.barCol}>
              <ThemedText style={[styles.valueLabel, { color: mutedColor }]}>
                {bar.value}
              </ThemedText>
              <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
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

      {/* Legend */}
      <View style={[styles.legendRow, { borderTopColor: borderColor }]}>
        <View style={[styles.dot, { backgroundColor: "#5D7DDF" }]} />
        <ThemedText style={[styles.legendText, { color: mutedColor }]}>
          Latest ({unit})
        </ThemedText>
        <View style={[styles.dot, { backgroundColor: "#3A4A77", marginLeft: 12 }]} />
        <ThemedText style={[styles.legendText, { color: mutedColor }]}>
          Previous ({unit})
        </ThemedText>
      </View>
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
  rangeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
  },
  rangeBtnActive: {
    backgroundColor: "#5D7DDF",
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },

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
  valueLabel: {
    fontSize: 10,
    marginBottom: 3,
  },
  barTrack: {
    width: "100%",
    height: 130,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});

export default SelfCompareCard;