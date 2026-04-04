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
 * Renders a horizontal range bar showing:
 *   lower_bound ──[====normal range====]── upper_bound
 *                        ▲ cohort avg
 *              ◆ patient value (marker that can sit inside or outside range)
 */
const OtherCompareCard = ({ bar, unit, higherIsBetter = true }: Props) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const { patientValue, cohortAvg, lowerBound, upperBound, percentile, cohortAgeRange } = bar;

  const fmt = (n: number) => parseFloat(n.toFixed(2));

  // ── Determine outcome ────────────────────────────────────────────────────
  const inRange = patientValue >= lowerBound && patientValue <= upperBound;
  const aboveRange = patientValue > upperBound;
  const belowRange = patientValue < lowerBound;

  const outcomeColor = inRange
    ? "#4CAF50"
    : higherIsBetter
    ? aboveRange ? "#4CAF50" : "#FF9800"
    : belowRange ? "#4CAF50" : "#FF9800";

  const outcomeLabel = inRange
    ? "Within normal range"
    : aboveRange
    ? higherIsBetter ? "Above normal range" : "Above normal range"
    : higherIsBetter ? "Below normal range" : "Below normal range";

  // ── Horizontal range bar math ────────────────────────────────────────────
  // Expand chart domain 10% on each side of the range so markers don't clip
  const rangeSpan = upperBound - lowerBound || 1;
  const domainMin = lowerBound - rangeSpan * 0.25;
  const domainMax = upperBound + rangeSpan * 0.25;
  const domainSpan = domainMax - domainMin;

  const toPct = (v: number) =>
    Math.min(100, Math.max(0, ((v - domainMin) / domainSpan) * 100));

  const rangeLPct = toPct(lowerBound);
  const rangeRPct = 100 - toPct(upperBound);
  const cohortPct = toPct(cohortAvg);
  const patientPct = toPct(patientValue);

  // ── Percentile insight ────────────────────────────────────────────────────
  const diffPct = Math.abs(
    Math.round(((patientValue - cohortAvg) / (cohortAvg || 1)) * 100)
  );
  const insightText =
    patientValue >= cohortAvg
      ? `${diffPct}% above peer average`
      : `${diffPct}% below peer average`;

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Peer Comparison
      </ThemedText>

      {/* Peer group pill */}
      <View style={[styles.pill, { borderColor }]}>
        <ThemedText style={{ fontSize: 12, color: mutedColor }}>
          Matched with · {cohortAgeRange}
        </ThemedText>
      </View>

      {/* Outcome badge */}
      <View style={[styles.outcomeBadge, { backgroundColor: outcomeColor + "22" }]}>
        <View style={[styles.outcomeDot, { backgroundColor: outcomeColor }]} />
        <ThemedText style={[styles.outcomeText, { color: outcomeColor }]}>
          {outcomeLabel}
        </ThemedText>
      </View>

      {/* ── Horizontal range bar ── */}
      <View style={styles.rangeSection}>
        {/* Axis labels */}
        <View style={styles.axisRow}>
          <ThemedText style={[styles.axisLabel, { color: mutedColor }]}>
            {fmt(lowerBound)} {unit}
          </ThemedText>
          <ThemedText style={[styles.axisLabel, { color: mutedColor, textAlign: "center" }]}>
            Normal range
          </ThemedText>
          <ThemedText style={[styles.axisLabel, { color: mutedColor, textAlign: "right" }]}>
            {fmt(upperBound)} {unit}
          </ThemedText>
        </View>

        {/* Track */}
        <View style={[styles.track, { backgroundColor: borderColor }]}>
          {/* Normal range fill */}
          <View
            style={[
              styles.rangeFill,
              {
                left: `${rangeLPct}%`,
                right: `${rangeRPct}%`,
                backgroundColor: "#5D7DDF33",
                borderColor: "#5D7DDF",
              },
            ]}
          />

          {/* Cohort avg marker (triangle / notch) */}
          <View style={[styles.cohortMarker, { left: `${cohortPct}%` }]}>
            <View style={[styles.cohortLine, { backgroundColor: "#A0AABB" }]} />
          </View>

          {/* Patient value marker */}
          <View style={[styles.patientMarker, { left: `${patientPct}%` }]}>
            <View style={[styles.patientDiamond, { backgroundColor: outcomeColor }]} />
          </View>
        </View>

        {/* Marker legend below track */}
        <View style={styles.markerLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDiamond, { backgroundColor: outcomeColor }]} />
            <ThemedText style={[styles.legendLabel, { color: mutedColor }]}>
              You · {fmt(patientValue)} {unit}
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: "#A0AABB" }]} />
            <ThemedText style={[styles.legendLabel, { color: mutedColor }]}>
              Peer avg · {fmt(cohortAvg)} {unit}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Insight row */}
      <View style={[styles.insightRow, { borderTopColor: borderColor }]}>
        <ThemedText style={[styles.insightText, { color: mutedColor }]}>
          {insightText}
          {percentile != null && (
            <>
              {" · "}
              <ThemedText type="defaultSemiBold" style={{ color: outcomeColor }}>
                {percentile}th percentile
              </ThemedText>
            </>
          )}
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },

  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },

  outcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    gap: 6,
  },
  outcomeDot: { width: 8, height: 8, borderRadius: 4 },
  outcomeText: { fontSize: 13, fontWeight: "600" },

  // ── Range bar ──
  rangeSection: { marginBottom: 4 },

  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  axisLabel: { fontSize: 11, flex: 1 },

  track: {
    height: 28,
    borderRadius: 14,
    position: "relative",
    overflow: "visible",
  },

  rangeFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 14,
  },

  cohortMarker: {
    position: "absolute",
    top: -6,
    bottom: -6,
    width: 2,
    marginLeft: -1,
    alignItems: "center",
  },
  cohortLine: {
    flex: 1,
    width: 2,
    borderRadius: 1,
  },

  patientMarker: {
    position: "absolute",
    top: "50%",
    marginTop: -8,
    marginLeft: -8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  patientDiamond: {
    width: 14,
    height: 14,
    borderRadius: 3,
    transform: [{ rotate: "45deg" }],
  },

  markerLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDiamond: {
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  legendLine: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
  },
  legendLabel: { fontSize: 12 },

  insightRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  insightText: { fontSize: 13 },
});

export default OtherCompareCard;