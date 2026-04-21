import CompareCard from "@/components/home/CompareCard";
import { DatePickerField } from "@/components/home/DatePickerField";
import SummaryBanner from "@/components/home/SummaryBanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareDuration, useHomeData } from "@/hooks/use-home-data";
import { CompareRow } from "@/types/report";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePatientStore } from "@/store/patient-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DURATION_OPTIONS: { key: CompareDuration; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

function buildRows(
  previous: Record<string, any> | null,
  latest: Record<string, any> | null,
): CompareRow[] {
  return [
    {
      label: "Leg Swing Speed",
      unit: "rad/s",
      previous: previous?.avg_max_gyr_ms ?? null,
      latest: latest?.avg_max_gyr_ms ?? null,
      higherIsBetter: true,
      disclaimer:
        "A slower swing often means dragging feet instead of lifting them.",
    },
    {
      label: "Foot Landing Force",
      unit: "rad/s",
      previous: previous?.avg_val_gyr_hs ?? null,
      latest: latest?.avg_val_gyr_hs ?? null,
      higherIsBetter: false,
      disclaimer:
        "High values suggest landing too heavily on the foot due to weak muscles, low values suggest limping or favoring one side.",
    },
    {
      label: "In-Air Time",
      unit: "s",
      previous: previous?.avg_swing_time ?? null,
      latest: latest?.avg_swing_time ?? null,
      higherIsBetter: false,
      disclaimer:
        "A shorter time in the air often happens when dragging feet or taking small steps.",
    },
    {
      label: "On-Ground Time",
      unit: "s",
      previous: previous?.avg_stance_time ?? null,
      latest: latest?.avg_stance_time ?? null,
      higherIsBetter: false,
      disclaimer:
        "Spending more time on the ground suggests a cautious walk, a sudden drop can indicate pain.",
    },
    {
      label: "Step Consistency",
      unit: "%",
      previous:
        previous?.avg_stride_cv != null
          ? +previous.avg_stride_cv.toFixed(1)
          : null,
      latest:
        latest?.avg_stride_cv != null ? +latest.avg_stride_cv.toFixed(1) : null,
      higherIsBetter: false,
      disclaimer:
        "Higher percentages mean steps are less regular, which increases the risk of a fall.",
    },
    {
      label: "Irregular Movements",
      unit: "",
      previous: previous?.anomaly_count ?? null,
      latest: latest?.anomaly_count ?? null,
      higherIsBetter: false,
      disclaimer: "The number of unexpected or anomalous movements detected.",
    },
  ];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FallAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const { role, username } = useAuth();
  const { selectedPatient } = usePatientStore();
  const headerName = role === "caregiver" ? selectedPatient?.username : username;

  const [fallDate, setFallDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState<CompareDuration>("week");

  const fallDateStr = fallDate ? toISODate(fallDate) : undefined;

  const { fallAnalysis, loading, error, refresh } = useHomeData(
    fallDateStr,
    "daily",
    undefined,
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const report = fallAnalysis?.[duration] ?? null;
  const rows = report ? buildRows(report.previous, report.latest) : [];
  const hasData =
    rows.length > 0 && (report?.previous != null || report?.latest != null);

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Fall Analysis</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Before vs after comparison
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            {!!headerName && (
              <ThemedText style={styles.patientName} numberOfLines={1}>
                {headerName}
              </ThemedText>
            )}
            <View style={[styles.avatar, { backgroundColor: cardColor }]}>
              <Ionicons name="person" size={22} color={tintColor} />
            </View>
          </TouchableOpacity>
        </ThemedView>

        {/* Error */}
        {error && (
          <ThemedText style={[styles.errorText, { color: C.error }]}>
            {error}
          </ThemedText>
        )}

        {/* Fall date picker */}
        <View style={styles.pickerSection}>
          <ThemedText style={[styles.fieldLabel, { color: C.muted }]}>
            FALL DATE
          </ThemedText>
          <DatePickerField
            label="Fall date"
            value={fallDate}
            placeholder="Select a date"
            onChange={setFallDate}
            onClear={() => setFallDate(null)}
          />
        </View>

        {/* Duration selector */}
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
                onPress={() => setDuration(option.key)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
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

        {/* No fall date selected — teach empty state */}
        {!fallDate && (
          <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
            <Ionicons
              name="analytics-outline"
              size={36}
              color={tintColor}
              style={{ marginBottom: 12 }}
            />
            <ThemedText style={styles.emptyHeadline}>
              Pick a fall date to begin
            </ThemedText>
            <ThemedText style={[styles.emptyBody, { color: C.muted }]}>
              Select the date a fall occurred above. This screen compares gait
              patterns from the period before the fall to the period after,
              helping identify whether walking ability has changed.
            </ThemedText>
          </View>
        )}

        {/* Loading */}
        {fallDate && loading && (
          <ActivityIndicator
            color={tintColor}
            style={{ marginVertical: 32 }}
          />
        )}

        {/* No data for selected date / duration */}
        {fallDate && !loading && !hasData && (
          <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
            <Ionicons
              name="bar-chart-outline"
              size={36}
              color={mutedColor}
              style={{ marginBottom: 12 }}
            />
            <ThemedText style={styles.emptyHeadline}>
              Not enough data
            </ThemedText>
            <ThemedText style={[styles.emptyBody, { color: C.muted }]}>
              No comparison data found for a {duration} window around{" "}
              {fallDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              . Try a different fall date or a shorter comparison period.
            </ThemedText>
          </View>
        )}

        {/* Results */}
        {fallDate && !loading && hasData && (
          <View style={styles.results}>
            <SummaryBanner rows={rows} />
            {rows.map((row) => (
              <CompareCard key={row.label} item={row} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 180,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  pickerSection: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  durationTrack: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  durationTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: "center",
  },
  emptyHeadline: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 300,
  },
  results: {
    gap: 0,
  },
});
