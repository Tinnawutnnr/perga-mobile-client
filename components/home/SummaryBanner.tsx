import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareRow } from "@/types/report";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

// ─── Helpers (Mirroring logic in CompareCard) ────────────────────────────────

/**
 * Calculates the percentage change between two values.
 */
function calcDelta(previous: number | null, latest: number | null): number {
  if (previous == null || latest == null) return 0;
  if (previous === 0 && latest === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((latest - previous) / Math.abs(previous)) * 100);
}

/**
 * Evaluates the status based on percentage delta and performance direction.
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

const SummaryBanner = ({ rows }: { rows: CompareRow[] }) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  if (rows.length === 0) return null;

  const evaluations = rows.map((row) =>
    evaluate(calcDelta(row.previous, row.latest), row.higherIsBetter),
  );

  const errorCount = evaluations.filter((e) => e === "error").length;
  const warningCount = evaluations.filter((e) => e === "warning").length;
  const badCount = errorCount + warningCount;

  let bgColor = colors.success + "22";
  let iconColor = colors.success;
  let icon: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
  let message = "Gait recovery looks stable";

  if (errorCount >= 2) {
    bgColor = colors.error + "22";
    iconColor = colors.error;
    icon = "close-circle-outline";
    message = "High risk indicators detected — clinical follow-up strongly recommended";
  } else if (badCount > 0) {
    bgColor = colors.warning + "22";
    iconColor = colors.warning;
    icon = "alert-outline";
    message = `${badCount} ${badCount === 1 ? "metric" : "metrics"} showing concerning changes`;
  }

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <ThemedText style={[styles.text, { color: iconColor }]}>
        {message}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  text: { flex: 1, fontSize: 13, fontWeight: "600" },
});

export default SummaryBanner;