import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { OtherBar } from "@/hooks/use-metric-compare";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  bar: OtherBar;
  unit: string;
  higherIsBetter?: boolean;
}

const OtherCompareCard = ({ bar, unit, higherIsBetter = true }: Props) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  const maxValue = Math.max(bar.selfValue, bar.peerValue, 1);
  const selfH = Math.round((bar.selfValue / maxValue) * 100);
  const peerH = Math.round((bar.peerValue / maxValue) * 100);

  const youWin = higherIsBetter
    ? bar.selfValue >= bar.peerValue
    : bar.selfValue <= bar.peerValue;

  const diffPct = Math.abs(
    Math.round(((bar.selfValue - bar.peerValue) / bar.peerValue) * 100)
  );

  const insightText = youWin
    ? `You are ${diffPct}% ${higherIsBetter ? "above" : "better than"} your peer group.`
    : `You are ${diffPct}% ${higherIsBetter ? "below" : "worse than"} your peer group.`;

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Peer Comparison
      </ThemedText>

      {/* Peer group pill */}
      <View style={[styles.pill, { borderColor }]}>
        <ThemedText style={{ fontSize: 12, color: mutedColor }}>
          Matched with · {bar.peerGroupLabel}
        </ThemedText>
      </View>

      {/* Insight line */}
      <ThemedText
        style={[styles.insight, { color: youWin ? "#4CAF50" : "#FF9800" }]}
      >
        {insightText}
      </ThemedText>

      {/* Side-by-side bars */}
      <View style={styles.chartWrap}>
        {/* You */}
        <View style={styles.barGroup}>
          <ThemedText style={[styles.barValue, { color: mutedColor }]}>
            {bar.selfValue} {unit}
          </ThemedText>
          <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.barFill,
                { height: `${selfH}%`, backgroundColor: "#5D7DDF" },
              ]}
            />
          </View>
          <ThemedText style={[styles.barLabel, { color: mutedColor }]}>
            You
          </ThemedText>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Peer avg */}
        <View style={styles.barGroup}>
          <ThemedText style={[styles.barValue, { color: mutedColor }]}>
            {bar.peerValue} {unit}
          </ThemedText>
          <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.barFill,
                { height: `${peerH}%`, backgroundColor: "#A0AABB" },
              ]}
            />
          </View>
          <ThemedText style={[styles.barLabel, { color: mutedColor }]}>
            Peer avg
          </ThemedText>
        </View>
      </View>

      {/* Percentile badge — only shown when API returns it */}
      {bar.percentile !== undefined && (
        <View style={[styles.percentileRow, { borderTopColor: borderColor }]}>
          <ThemedText style={{ fontSize: 13, color: mutedColor }}>
            You are in the{" "}
            <ThemedText
              type="defaultSemiBold"
              style={{ color: youWin ? "#4CAF50" : "#FF9800" }}
            >
              {bar.percentile}th percentile
            </ThemedText>{" "}
            of your peer group.
          </ThemedText>
        </View>
      )}
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
    marginBottom: 10,
  },
  insight: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 20,
  },

  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 200,
    gap: 0,
  },
  barGroup: {
    width: 100,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barValue: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  barTrack: {
    width: 56,
    height: 140,
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },

  divider: {
    width: 1,
    height: 140,
    alignSelf: "flex-end",
    marginBottom: 32,
    marginHorizontal: 8,
  },

  percentileRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

export default OtherCompareCard;