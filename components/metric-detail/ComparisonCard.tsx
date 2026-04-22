import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BenchmarkBar } from "@/types/compare";
import React from "react";
import { StyleSheet, View } from "react-native";

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Props {
  bar: BenchmarkBar;
  unit: string;
  higherIsBetter?: boolean;
}

const CHART_H = 110;
const NUM_COLS = 7;

const ComparisonCard = ({ bar, unit, higherIsBetter = true }: Props) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const { patientValue, cohortAvg, lowerBound, upperBound, cohortAgeRange } = bar;
  const fmt = (n: number) => parseFloat(n.toFixed(2));

  const span = upperBound - lowerBound || 1;
  const step = span / (NUM_COLS - 1);
  const sigma = span / 4;
  const mid = (lowerBound + upperBound) / 2;
  const gaussian = (x: number) =>
    Math.exp(-0.5 * Math.pow((x - mid) / sigma, 2));

  const snapIdx = (val: number) =>
    Math.min(NUM_COLS - 1, Math.max(0, Math.round((val - lowerBound) / step)));

  let cohortIdx = snapIdx(cohortAvg);
  let patientIdx = snapIdx(patientValue);

  if (patientIdx === cohortIdx) {
    if (patientValue >= cohortAvg && patientIdx < NUM_COLS - 1) patientIdx += 1;
    else if (patientIdx > 0) patientIdx -= 1;
    else patientIdx += 1;
  }

  const patientOutside = patientValue < lowerBound || patientValue > upperBound;
  if (patientOutside) {
    patientIdx = patientValue < lowerBound ? 0 : NUM_COLS - 1;
    if (patientIdx === cohortIdx) {
      cohortIdx = patientIdx === 0 ? 1 : NUM_COLS - 2;
    }
  }

  const inRange = !patientOutside;
  const outcomeColor = inRange
    ? C.success
    : higherIsBetter
    ? patientValue > upperBound ? C.success : C.warning
    : patientValue < lowerBound ? C.success : C.warning;

  const columns = Array.from({ length: NUM_COLS }, (_, i) => {
    const v = lowerBound + i * step;
    return {
      value: Math.round(v * 10) / 10,
      height: gaussian(v),
      isPatient: i === patientIdx,
      isCohort: i === cohortIdx,
    };
  });

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <ThemedText style={styles.sectionTitle}>Distribution in peer group</ThemedText>

      <ThemedText type="muted" style={styles.subtitle}>
        {cohortAgeRange} · normal range {fmt(lowerBound)}–{fmt(upperBound)} {unit}
      </ThemedText>

      {/* Bell-curve bar chart */}
      <View style={styles.chartWrap}>
        {columns.map((col, i) => {
          const heightPx = Math.max(14, Math.round(col.height * CHART_H));
          const bgColor = col.isPatient
            ? outcomeColor
            : col.isCohort
            ? mutedColor
            : hexToRGBA(mutedColor, 0.25);

          return (
            <View key={i} style={styles.colWrap}>
              <View style={styles.barWrap}>
                {col.isCohort && (
                  <ThemedText style={[styles.floatLabel, { color: mutedColor }]}>
                    avg
                  </ThemedText>
                )}
                {col.isPatient && (
                  <ThemedText style={[styles.floatLabel, { color: outcomeColor, fontWeight: "700" }]}>
                    you
                  </ThemedText>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: heightPx,
                      backgroundColor: bgColor,
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.colLabel, { color: mutedColor }]}>
                {fmt(col.value)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legendRow, { borderTopColor: borderColor }]}>
        <View style={[styles.legendDot, { backgroundColor: outcomeColor }]} />
        <ThemedText style={[styles.legendText, { color: mutedColor }]}>
          You · {fmt(patientValue)} {unit}
        </ThemedText>
        <View style={[styles.legendDot, { backgroundColor: mutedColor, marginLeft: 12 }]} />
        <ThemedText style={[styles.legendText, { color: mutedColor }]}>
          Peer avg · {fmt(cohortAvg)} {unit}
        </ThemedText>
      </View>

      <View style={styles.rangeRow}>
        <ThemedText style={[styles.rangeLabel, { color: mutedColor }]}>← Lower</ThemedText>
        <ThemedText style={[styles.rangeLabel, { color: mutedColor }]}>Higher →</ThemedText>
      </View>
    </View>
  );
};

export default ComparisonCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  subtitle: { fontSize: 12, marginBottom: 16, lineHeight: 17 },

  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: CHART_H + 44,
    gap: 4,
    overflow: "visible",
  },
  colWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  floatLabel: {
    position: "absolute",
    top: -22,
    left: -40,
    right: -40,
    fontSize: 10,
    textAlign: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  colLabel: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rangeLabel: { fontSize: 11 },
});
