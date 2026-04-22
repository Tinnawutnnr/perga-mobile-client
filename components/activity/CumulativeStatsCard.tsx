import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SessionTotals } from "@/utils/activity-session";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  totals: SessionTotals;
};

export const CumulativeStatsCard: React.FC<Props> = ({ totals }) => {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  const hasData = totals.steps > 0 || totals.distanceM > 0 || totals.kcal > 0;

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <ThemedText style={[styles.sectionLabel, { color: C.muted }]}>
        SESSION TOTALS
      </ThemedText>

      <View style={styles.statsRow}>
        {/* Steps — primary stat, larger */}
        <View style={styles.stepsBlock}>
          <ThemedText
            style={[
              styles.stepsValue,
              { color: hasData ? tintColor : C.muted },
            ]}
            numberOfLines={1}
          >
            {totals.steps.toLocaleString()}
          </ThemedText>
          <ThemedText style={[styles.stepsUnit, { color: C.muted }]}>
            steps
          </ThemedText>
        </View>

        {/* Vertical divider */}
        <View style={[styles.dividerV, { backgroundColor: borderColor }]} />

        {/* Distance and energy — secondary, stacked */}
        <View style={styles.secondaryBlock}>
          <View style={styles.secondaryStat}>
            <ThemedText
              style={[
                styles.secondaryValue,
                { color: hasData ? tintColor : C.muted },
              ]}
            >
              {totals.distanceM.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.secondaryUnit, { color: C.muted }]}>
              metres
            </ThemedText>
          </View>
          <View
            style={[styles.hairlineH, { backgroundColor: borderColor }]}
          />
          <View style={styles.secondaryStat}>
            <ThemedText
              style={[
                styles.secondaryValue,
                { color: hasData ? tintColor : C.muted },
              ]}
            >
              {totals.kcal.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.secondaryUnit, { color: C.muted }]}>
              kcal
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stepsBlock: {
    flex: 1,
    paddingRight: 20,
    justifyContent: "center",
    gap: 3,
  },
  stepsValue: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 40,
  },
  stepsUnit: {
    fontSize: 13,
    fontWeight: "500",
  },
  dividerV: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 0,
    alignSelf: "stretch",
  },
  secondaryBlock: {
    flex: 1,
    paddingLeft: 20,
    gap: 0,
  },
  secondaryStat: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  secondaryValue: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  secondaryUnit: {
    fontSize: 11,
    fontWeight: "500",
  },
  hairlineH: {
    height: StyleSheet.hairlineWidth,
  },
});
