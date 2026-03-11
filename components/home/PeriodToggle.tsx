import { Period } from "@/hooks/use-home-data";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TABS: { key: Period; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "yearly", label: "Yearly" },
];

interface PeriodToggleProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  const tintColor = useThemeColor({}, "tint");
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View style={[styles.track, { backgroundColor: cardColor }]}>
      {TABS.map(({ key, label }) => {
        const active = key === value;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.tab, active && { backgroundColor: tintColor }]}
            onPress={() => onChange(key)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.label, { color: active ? "#fff" : mutedColor }]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
