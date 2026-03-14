import { SessionTotals } from "@/utils/activity-session";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

type Props = {
  totals: SessionTotals;
  tintColor: string;
  cardColor: string;
  borderColor: string;
};

export const CumulativeStatsCard: React.FC<Props> = ({
  totals,
  tintColor,
  cardColor,
  borderColor,
}) => {
  return (
    <ThemedView
      style={[styles.card, { backgroundColor: cardColor, borderColor }]}
    >
      <ThemedText style={styles.title}>Cumulative Stat</ThemedText>
      <View style={styles.row}>
        <View style={styles.cell}>
          <ThemedText style={[styles.value, { color: tintColor }]}>
            {totals.steps}
          </ThemedText>
          <ThemedText type="muted" style={styles.label}>
            Steps
          </ThemedText>
        </View>
        <View style={styles.cell}>
          <ThemedText style={[styles.value, { color: tintColor }]}>
            {totals.distanceM.toFixed(1)} m
          </ThemedText>
          <ThemedText type="muted" style={styles.label}>
            Distance
          </ThemedText>
        </View>
        <View style={styles.cell}>
          <ThemedText style={[styles.value, { color: tintColor }]}>
            {totals.kcal.toFixed(1)} kcal
          </ThemedText>
          <ThemedText type="muted" style={styles.label}>
            Energy
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cell: {
    alignItems: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    fontSize: 11,
  },
});
