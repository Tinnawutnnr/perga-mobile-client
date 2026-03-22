import CompareCard from "@/components/home/CompareCard";
import SummaryBanner from "@/components/home/SummaryBanner";
import { ThemedText } from "@/components/themed-text";
import { CompareDuration, CompareMetric } from "@/hooks/use-home-data";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { DatePickerField } from "./DatePickerField";

const DURATION_OPTIONS: { key: CompareDuration; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const DURATION_DAYS: Record<CompareDuration, number> = {
  week: 7,
  month: 30,
  year: 365,
};

interface FallCompareSectionProps {
  fallDate: Date | null;
  onFallDateChange: (date: Date) => void;
  onFallDateClear: () => void;
  duration: CompareDuration;
  onDurationChange: (duration: CompareDuration) => void;
  comparison: CompareMetric[];
  loading: boolean;
}

export function FallCompareSection({
  fallDate,
  onFallDateChange,
  onFallDateClear,
  duration,
  onDurationChange,
  comparison,
  loading,
}: FallCompareSectionProps) {
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  const days = DURATION_DAYS[duration];

  return (
    <>
      <ThemedText style={styles.sectionTitle}>Before vs After Fall</ThemedText>
      <ThemedText type="muted" style={styles.sectionDesc}>
        Compares {days}-day average before the fall date vs the latest {days}
        -day post-fall data.
      </ThemedText>

      <DatePickerField
        label="Fall date"
        value={fallDate}
        placeholder="Tap to select"
        onChange={onFallDateChange}
        onClear={onFallDateClear}
      />

      <View style={[styles.durationTrack, { backgroundColor: cardColor }]}>
        {DURATION_OPTIONS.map((option) => {
          const active = option.key === duration;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.durationTab,
                active && { backgroundColor: tintColor },
              ]}
              onPress={() => onDurationChange(option.key)}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.durationLabel,
                  { color: active ? "#FFFFFF" : mutedColor },
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

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
            Not enough data for a {duration} comparison.{"\n"}
            Please pick another fall date or a shorter duration.
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
  durationTrack: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginTop: 12,
  },
  durationTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  durationLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
  },
});
