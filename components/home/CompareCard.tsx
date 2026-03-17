import BarRow from "@/components/home/BarRow";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareMetric } from "@/hooks/use-home-data";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

const CompareCard = ({ item }: { item: CompareMetric }) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  // Map the new evaluation directly to colors based on biomechanical criteria:
  // - "error" (Red/Alert): Critical regressions (e.g., sudden drop in Stance Time indicating pain avoidance, drop in Swing Time indicating shuffling, spiked Heel Impact indicating foot slapping)
  // - "warning" (Orange/Caution): Compensatory behaviors (e.g., increased Stance Time indicating cautious walking/fear of falling, dropped Heel Impact indicating limping)
  // - "success" (Green/Good): Stable or improving metrics
  let deltaColor = colors.success; // Default green
  let deltaIcon: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";

  if (item.evaluation === "error") {
    deltaColor = colors.error; // Red
    deltaIcon = "trending-down-outline";
  } else if (item.evaluation === "warning") {
    deltaColor = colors.warning; // Orange color for warnings/cautions
    deltaIcon = "alert-circle-outline";
  } else {
    deltaIcon = "trending-up-outline";
  }

  const arrow = item.deltaPercent > 0 ? "▲" : item.deltaPercent < 0 ? "▼" : "–";

  const beforeColor = scheme === "dark" ? "#5D7DDF" : "#4F7D81";
  const afterColor = deltaColor;
  const maxVal =
    Math.max(Math.abs(item.before), Math.abs(item.after)) * 1.15 || 1;
  const fmtVal = (n: number) => `${n}${item.unit ? ` ${item.unit}` : ""}`;

  return (
    <ThemedView
      style={styles.card}
      lightColor={colors.card}
      darkColor={colors.card}
    >
      <View style={styles.topRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ThemedText style={styles.metricLabel}>{item.label}</ThemedText>
          {item.evaluation === "warning" && (
            <View style={[styles.pill, { backgroundColor: deltaColor + "22" }]}>
              <ThemedText style={[styles.pillText, { color: deltaColor }]}>
                Caution
              </ThemedText>
            </View>
          )}
          {item.evaluation === "error" && (
            <View style={[styles.pill, { backgroundColor: deltaColor + "22" }]}>
              <ThemedText style={[styles.pillText, { color: deltaColor }]}>
                Alert
              </ThemedText>
            </View>
          )}
        </View>
        <View
          style={[styles.deltaBadge, { backgroundColor: deltaColor + "18" }]}
        >
          <Ionicons name={deltaIcon} size={13} color={deltaColor} />
          <ThemedText style={[styles.deltaText, { color: deltaColor }]}>
            {arrow} {Math.abs(item.deltaPercent)}%
          </ThemedText>
        </View>
      </View>

      <BarRow
        label="Before"
        value={item.before}
        max={maxVal}
        color={beforeColor}
        valueStr={fmtVal(item.before)}
      />
      <BarRow
        label="After"
        value={item.after}
        max={maxVal}
        color={afterColor}
        valueStr={fmtVal(item.after)}
      />

      {/* Render the specific clinical disclaimer we passed */}
      {item.disclaimer ? (
        <ThemedText style={[styles.disclaimer, { color: deltaColor }]}>
          {item.disclaimer}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricLabel: { fontSize: 15, fontWeight: "600" },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "600" },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deltaText: { fontSize: 13, fontWeight: "700" },
  disclaimer: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.85,
    fontStyle: "italic",
  },
});

export default CompareCard;
