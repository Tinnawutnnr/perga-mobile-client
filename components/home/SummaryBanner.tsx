import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareMetric } from "@/hooks/use-home-data";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

const SummaryBanner = ({ comparison }: { comparison: CompareMetric[] }) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  if (comparison.length === 0) return null;

  // Count errors (Red/Alert) and warnings (Orange/Caution) based on the new evaluation flag
  const errorCount = comparison.filter((m) => m.evaluation === "error").length;
  const warningCount = comparison.filter(
    (m) => m.evaluation === "warning",
  ).length;
  const badCount = errorCount + warningCount;

  let bgColor = colors.success + "22";
  let iconColor = colors.success;
  let icon: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
  let message = "Gait recovery looks stable";

  // If there are multiple errors, it's high risk
  if (errorCount >= 2) {
    bgColor = colors.error + "22";
    iconColor = colors.error;
    icon = "close-circle-outline";
    message =
      "High risk indicators detected — clinical follow-up strongly recommended";
  }
  // If there's 1 error, or just general warnings
  else if (badCount > 0) {
    bgColor = "#E69A45" + "22"; // Using the orange caution color
    iconColor = "#E69A45";
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
