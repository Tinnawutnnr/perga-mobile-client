import CompareCard from "@/components/home/CompareCard";
import SummaryBanner from "@/components/home/SummaryBanner";
import { ThemedText } from "@/components/themed-text";
import { FallAnalysisResponse } from "@/types/report";
import { CompareDuration } from "@/hooks/use-home-data";
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

// ─── Types ────────────────────────────────────────────────────────────────────

// Fields to be displayed in CompareCard — mapped directly from previous/latest
interface CompareRow {
  label: string;
  unit: string;
  previous: number | null;
  latest: number | null;
  higherIsBetter: boolean;
  disclaimer?: string;
}

// ─── Helper: Transform previous/latest record → CompareRow[] ─────────────────

function buildRows(
  previous: Record<string, any> | null,
  latest: Record<string, any> | null,
): CompareRow[] {
  return [
    {
      label: "Swing Speed",
      unit: "rad/s",
      previous: previous?.avg_max_gyr_ms ?? null,
      latest: latest?.avg_max_gyr_ms ?? null,
      higherIsBetter: true,
      disclaimer: "Decrease indicates muscle weakness/onset of shuffling gait",
    },
    {
      label: "Heel Impact",
      unit: "rad/s",
      previous: previous?.avg_val_gyr_hs ?? null,
      latest: latest?.avg_val_gyr_hs ?? null,
      higherIsBetter: false,
      disclaimer:
        "Spike indicates foot slapping; drop indicates antalgic gait/limping",
    },
    {
      label: "Swing Time",
      unit: "s",
      previous: previous?.avg_swing_time ?? null,
      latest: latest?.avg_swing_time ?? null,
      higherIsBetter: false,
      disclaimer: "Decrease correlates with shortened step/dragging",
    },
    {
      label: "Stance Time",
      unit: "s",
      previous: previous?.avg_stance_time ?? null,
      latest: latest?.avg_stance_time ?? null,
      higherIsBetter: false,
      disclaimer:
        "Increase indicates cautious walking; sudden drop indicates pain avoidance",
    },
    {
      label: "Stride CV",
      unit: "%",
      previous:
        previous?.avg_stride_cv != null
          ? +(previous.avg_stride_cv * 100).toFixed(1)
          : null,
      latest:
        latest?.avg_stride_cv != null
          ? +(latest.avg_stride_cv * 100).toFixed(1)
          : null,
      higherIsBetter: false,
      disclaimer: "High value is a predictor of future falls",
    },
    {
      label: "Anomalies",
      unit: "",
      previous: previous?.anomaly_count ?? null,
      latest: latest?.anomaly_count ?? null,
      higherIsBetter: false,
    },
  ];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FallCompareSectionProps {
  fallDate: Date | null;
  onFallDateChange: (date: Date) => void;
  onFallDateClear: () => void;
  duration: CompareDuration;
  onDurationChange: (duration: CompareDuration) => void;
  fallAnalysis: FallAnalysisResponse | null;
  loading: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FallCompareSection({
  fallDate,
  onFallDateChange,
  onFallDateClear,
  duration,
  onDurationChange,
  fallAnalysis,
  loading,
}: FallCompareSectionProps) {
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  // Select previous/latest based on the duration selected by the user
  const report = fallAnalysis?.[duration] ?? null;
  const rows =
    report ? buildRows(report.previous, report.latest) : [];
  const hasData = rows.length > 0 && (report?.previous != null || report?.latest != null);

  return (
    <>
      <ThemedText style={styles.sectionTitle}>Before vs After Fall</ThemedText>
      <ThemedText type="muted" style={styles.sectionDesc}>
        Compares the period before the fall date vs the latest period after.
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

      {fallDate && hasData && (
        <View style={styles.compareList}>
          <SummaryBanner rows={rows} />
          {rows.map((row) => (
            <CompareCard key={row.label} item={row} />
          ))}
        </View>
      )}

      {fallDate && !hasData && !loading && (
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