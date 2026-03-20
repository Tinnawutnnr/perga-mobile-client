import CompareCard from "@/components/home/CompareCard";
import SummaryBanner from "@/components/home/SummaryBanner";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareMetric } from "@/hooks/use-home-data";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { DatePickerField } from "./DatePickerField";

interface FallCompareSectionProps {
  fallDate: Date | null;
  onFallDateChange: (date: Date) => void;
  onFallDateClear: () => void;
  comparison: CompareMetric[];
  loading: boolean;
}

export function FallCompareSection({
  fallDate,
  onFallDateChange,
  onFallDateClear,
  comparison,
  loading,
}: FallCompareSectionProps) {
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");
  const scheme = useColorScheme() ?? "light";

  return (
    <>
      <ThemedText style={styles.sectionTitle}>Before vs After Fall</ThemedText>
      <ThemedText type="muted" style={styles.sectionDesc}>
        Compares the 7-day average before and after the selected fall date.
      </ThemedText>

      <DatePickerField
        label="Fall date"
        value={fallDate}
        placeholder="Tap to select"
        onChange={onFallDateChange}
        onClear={onFallDateClear}
      />

      {fallDate && comparison.length > 0 && (
        <View style={styles.compareList}>
          <SummaryBanner comparison={comparison} />
          {comparison.map((item) => (
            <CompareCard key={item.label} item={item} />
          ))}
        </View>
      )}

      {fallDate && comparison.length === 0 && !loading && (
        <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
          <Ionicons name="bar-chart-outline" size={32} color={mutedColor} />
          <ThemedText
            style={{ color: mutedColor, marginTop: 8, textAlign: "center" }}
          >
            Not enough data around this date.{"\n"}At least 1 day on each side
            is needed.
          </ThemedText>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  compareList: {
    marginTop: 16,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
  },
});