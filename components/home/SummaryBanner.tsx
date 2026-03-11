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

  const badCount = comparison.filter(
    (m) =>
      !m.neutral &&
      !(
        (m.higherIsBetter && m.deltaPercent >= 0) ||
        (!m.higherIsBetter && m.deltaPercent <= 0)
      ),
  ).length;
  const total = comparison.filter((m) => !m.neutral).length;

  let bgColor = colors.success + "22";
  let iconColor = colors.success;
  let icon: keyof typeof Ionicons.glyphMap = "checkmark-circle-outline";
  let message = "Gait recovery looks stable";

  if (badCount > 0 && badCount < total) {
    bgColor = colors.warning + "22";
    iconColor = colors.warning;
    icon = "alert-outline";
    message = `${badCount} of ${total} metrics worsened after the fall`;
  } else if (badCount === total && total > 0) {
    bgColor = colors.error + "22";
    iconColor = colors.error;
    icon = "close-circle-outline";
    message = "All tracked metrics declined — follow up recommended";
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
