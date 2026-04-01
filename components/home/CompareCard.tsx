import BarRow from "@/components/home/BarRow";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareRow } from "@/types/report";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculates delta percentage from previous to latest.
 */
function calcDelta(previous: number | null, latest: number | null): number {
  if (previous == null || latest == null) return 0;
  if (previous === 0 && latest === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((latest - previous) / Math.abs(previous)) * 100);
}

/**
 * MCID thresholds (Perera et al. 2006)
 * < 5%  = Normal variance  → success
 * 5–10% = Small change     → warning
 * > 10% = Substantial      → error
 */
function evaluate(
  deltaPercent: number,
  higherIsBetter: boolean,
): "success" | "warning" | "error" {
  const abs = Math.abs(deltaPercent);
  const isRegression = higherIsBetter ? deltaPercent < 0 : deltaPercent > 0;
  if (!isRegression) return "success";
  if (abs >= 10) return "error";
  if (abs >= 5) return "warning";
  return "success";
}

// ─── Component ────────────────────────────────────────────────────────────────

const CompareCard = ({ item }: { item: CompareRow }) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const deltaPercent = calcDelta(item.previous, item.latest);
  const evaluation = evaluate(deltaPercent, item.higherIsBetter);

  let deltaColor = colors.success;
  let deltaIcon: keyof typeof Ionicons.glyphMap = "trending-up-outline";

  if (evaluation === "error") {
    deltaColor = colors.error;
    deltaIcon = "trending-down-outline";
  } else if (evaluation === "warning") {
    deltaColor = colors.warning;
    deltaIcon = "alert-circle-outline";
  } else {
    deltaIcon = "checkmark-circle-outline";
  }

  const arrow = deltaPercent > 0 ? "▲" : deltaPercent < 0 ? "▼" : "–";
  const beforeColor = scheme === "dark" ? "#5D7DDF" : "#4F7D81";
  const afterColor = deltaColor;

  const prev = item.previous ?? 0;
  const late = item.latest ?? 0;
  const maxVal = Math.max(Math.abs(prev), Math.abs(late)) * 1.15 || 1;
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
          {evaluation === "warning" && (
            <View style={[styles.pill, { backgroundColor: deltaColor + "22" }]}>
              <ThemedText style={[styles.pillText, { color: deltaColor }]}>
                Caution
              </ThemedText>
            </View>
          )}
          {evaluation === "error" && (
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
            {arrow} {Math.abs(deltaPercent)}%
          </ThemedText>
        </View>
      </View>

      <BarRow
        label="Before"
        value={prev}
        max={maxVal}
        color={beforeColor}
        valueStr={fmtVal(prev)}
      />
      <BarRow
        label="After"
        value={late}
        max={maxVal}
        color={afterColor}
        valueStr={fmtVal(late)}
      />

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