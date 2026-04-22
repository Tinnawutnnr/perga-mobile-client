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

const OtherCompareCard = ({ bar, unit, higherIsBetter = true }: Props) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const tintColor = useThemeColor({}, "tint");

  const { patientValue, cohortAvg, lowerBound, upperBound, percentile, cohortAgeRange } = bar;
  const fmt = (n: number) => parseFloat(n.toFixed(2));

  const inRange = patientValue >= lowerBound && patientValue <= upperBound;
  const aboveRange = patientValue > upperBound;
  const belowRange = patientValue < lowerBound;

  const outcomeColor = inRange
    ? C.success
    : higherIsBetter
    ? aboveRange ? C.success : C.warning
    : belowRange ? C.success : C.warning;

  const outcomeLabel = inRange
    ? "Within normal range"
    : aboveRange ? "Above normal range"
    : "Below normal range";

  // Domain spans 25% beyond each side of the normal range for margin
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

  const diffPct = Math.abs(
    Math.round(((patientValue - cohortAvg) / (cohortAvg || 1)) * 100)
  );
  const insightText =
    patientValue >= cohortAvg
      ? `${diffPct}% above peer average`
      : `${diffPct}% below peer average`;

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <ThemedText style={styles.sectionTitle}>Peer comparison</ThemedText>

      {/* Peer group + outcome in one row */}
      <View style={styles.metaRow}>
        <ThemedText type="muted" style={styles.cohortLabel}>
          {cohortAgeRange}
        </ThemedText>
        <View style={[styles.outcomeBadge, { backgroundColor: hexToRGBA(outcomeColor, 0.1) }]}>
          <View style={[styles.outcomeDot, { backgroundColor: outcomeColor }]} />
          <ThemedText style={[styles.outcomeText, { color: outcomeColor }]}>
            {outcomeLabel}
          </ThemedText>
        </View>
      </View>

      {/* Axis labels */}
      <View style={styles.axisRow}>
        <ThemedText style={[styles.axisLabel, { color: mutedColor }]}>
          {fmt(lowerBound)} {unit}
        </ThemedText>
        <ThemedText style={[styles.axisLabel, styles.axisCenter, { color: mutedColor }]}>
          Normal range
        </ThemedText>
        <ThemedText style={[styles.axisLabel, styles.axisRight, { color: mutedColor }]}>
          {fmt(upperBound)} {unit}
        </ThemedText>
      </View>

      {/* Range track */}
      <View style={[styles.track, { backgroundColor: borderColor }]}>
        {/* Normal range fill */}
        <View
          style={[
            styles.rangeFill,
            {
              left: `${rangeLPct}%`,
              right: `${rangeRPct}%`,
              backgroundColor: hexToRGBA(tintColor, 0.12),
              borderColor: hexToRGBA(tintColor, 0.4),
            },
          ]}
        />
        {/* Cohort avg — vertical line */}
        <View style={[styles.cohortMarker, { left: `${cohortPct}%` }]}>
          <View style={[styles.cohortLine, { backgroundColor: mutedColor }]} />
        </View>
        {/* Patient value — diamond */}
        <View style={[styles.patientMarker, { left: `${patientPct}%` }]}>
          <View style={[styles.patientDiamond, { backgroundColor: outcomeColor }]} />
        </View>
      </View>

      {/* Marker legend */}
      <View style={styles.markerLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDiamond, { backgroundColor: outcomeColor }]} />
          <ThemedText style={[styles.legendLabel, { color: mutedColor }]}>
            You · {fmt(patientValue)} {unit}
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: mutedColor }]} />
          <ThemedText style={[styles.legendLabel, { color: mutedColor }]}>
            Peer avg · {fmt(cohortAvg)} {unit}
          </ThemedText>
        </View>
      </View>

      {/* Insight */}
      <View style={[styles.insightRow, { borderTopColor: borderColor }]}>
        <ThemedText style={[styles.insightText, { color: mutedColor }]}>
          {insightText}
          {percentile != null && (
            <>
              {" · "}
              <ThemedText style={[styles.insightEmphasis, { color: outcomeColor }]}>
                {percentile}th percentile
              </ThemedText>
            </>
          )}
        </ThemedText>
      </View>
    </View>
  );
};

export default OtherCompareCard;

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
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  cohortLabel: {
    fontSize: 13,
  },
  outcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  outcomeDot: { width: 7, height: 7, borderRadius: 3.5 },
  outcomeText: { fontSize: 13, fontWeight: "600" },

  axisRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  axisLabel: { fontSize: 11, flex: 1 },
  axisCenter: { textAlign: "center" },
  axisRight: { textAlign: "right" },

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
    borderWidth: StyleSheet.hairlineWidth,
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
  cohortLine: { flex: 1, width: 2, borderRadius: 1 },
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
  legendLine: { width: 12, height: 2, borderRadius: 1 },
  legendLabel: { fontSize: 12 },

  insightRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  insightText: { fontSize: 13, lineHeight: 19 },
  insightEmphasis: { fontWeight: "600" },
});
