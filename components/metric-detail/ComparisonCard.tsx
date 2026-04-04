import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BenchmarkBar } from "@/types/compare";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  bar: BenchmarkBar;
  unit: string;
  higherIsBetter?: boolean;
}

/**
 * Bell-curve-style column chart:
 *   • 7 columns spanning [lowerBound … upperBound]
 *   • Column heights follow a normal distribution shape
 *   • Patient value column is highlighted
 *   • Cohort avg column is marked
 */
const ComparisonCard = ({ bar, unit, higherIsBetter = true }: Props) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const { patientValue, cohortAvg, lowerBound, upperBound, cohortAgeRange } = bar;

  const fmt = (n: number) => parseFloat(n.toFixed(2));

  // ── Build 7 evenly-spaced buckets across [lower, upper] ──────────────────
  const NUM_COLS = 7;
  const span = upperBound - lowerBound || 1;
  const step = span / (NUM_COLS - 1);

  // Normal distribution height (σ = span/4 so ~95% of range fits within ±2σ)
  const sigma = span / 4;
  const mid = (lowerBound + upperBound) / 2;
  const gaussian = (x: number) =>
    Math.exp(-0.5 * Math.pow((x - mid) / sigma, 2));

  interface Column {
    value: number;           // actual metric value this bucket represents
    height: number;          // 0–1 normalised height
    isPatient: boolean;
    isCohort: boolean;
  }

  // Snap each value to nearest bucket, clamped within [0, NUM_COLS-1]
  const snapIdx = (val: number) =>
    Math.min(NUM_COLS - 1, Math.max(0, Math.round((val - lowerBound) / step)));

  let cohortIdx = snapIdx(cohortAvg);
  let patientIdx = snapIdx(patientValue);

  // If they land on the same bucket, nudge patient in the direction it actually sits
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

  const columns: Column[] = Array.from({ length: NUM_COLS }, (_, i) => {
    const v = lowerBound + i * step;
    return {
      value: Math.round(v * 10) / 10,
      height: gaussian(v),
      isPatient: i === patientIdx,
      isCohort: i === cohortIdx,
    };
  });

  const inRange = !patientOutside;
  const outcomeColor = inRange
    ? "#4CAF50"
    : higherIsBetter
    ? patientValue > upperBound ? "#4CAF50" : "#FF9800"
    : patientValue < lowerBound ? "#4CAF50" : "#FF9800";

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Distribution in Peer Group
      </ThemedText>

      <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
        {cohortAgeRange} · normal range {fmt(lowerBound)}–{fmt(upperBound)} {unit}
      </ThemedText>

      {/* Bell-curve bar chart */}
      <View style={styles.chartWrap}>
        {columns.map((col, i) => {
          const heightPx = Math.max(16, Math.round(col.height * CHART_H));
          const bgColor = col.isPatient
            ? outcomeColor
            : col.isCohort
            ? "#A0AABB"
            : "#34456F";

          return (
            <View key={i} style={styles.colWrap}>
              <View style={styles.barWrap}>
                {/* Labels float absolutely above bar — won't push bar down */}
                {col.isCohort && (
                  <ThemedText style={[styles.cohortLabel, { color: mutedColor }]}>
                    avg
                  </ThemedText>
                )}
                {col.isPatient && (
                  <ThemedText style={[styles.patientLabel, { color: outcomeColor }]}>
                    you
                  </ThemedText>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: heightPx,
                      backgroundColor: bgColor,
                      opacity: col.isPatient || col.isCohort ? 1 : 0.55,
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
        <View style={[styles.legendDot, { backgroundColor: "#A0AABB", marginLeft: 12 }]} />
        <ThemedText style={[styles.legendText, { color: mutedColor }]}>
          Peer avg · {fmt(cohortAvg)} {unit}
        </ThemedText>
      </View>

      {/* Range labels */}
      <View style={[styles.rangeRow]}>
        <ThemedText style={{ fontSize: 11, color: mutedColor }}>
          ← Lower
        </ThemedText>
        <ThemedText style={{ fontSize: 11, color: mutedColor }}>
          Higher →
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const CHART_H = 110;

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 16 },

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
  cohortLabel: {
    position: "absolute",
    top: -24,
    left: -40,
    right: -40,
    fontSize: 10,
    textAlign: "center",
  },
  patientLabel: {
    position: "absolute",
    top: -24,
    left: -40,
    right: -40,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  labelSpacer: {
    height: 14,
    marginBottom: 2,
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
    borderTopWidth: 1,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },

  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});

export default ComparisonCard;