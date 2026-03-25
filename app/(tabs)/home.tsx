import { DatePickerField } from "@/components/home/DatePickerField";
import { FallCompareSection } from "@/components/home/FallCompareSection";
import { GaitMetricsSection } from "@/components/home/GaitMetricSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CompareDuration, useHomeData } from "@/hooks/use-home-data";
import { useMetrics } from "@/hooks/use-metrics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Formats date for UI display (e.g., 25 Mar 2026)
 */
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Formats date for API calls (YYYY-MM-DD)
 */
const toISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SummaryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const scheme = useColorScheme() ?? "light";

  const insets = useSafeAreaInsets();

  const [fallDate, setFallDate] = useState<Date | null>(null);
  const [selectedViewDate, setSelectedViewDate] = useState<Date | null>(null);
  const [compareDuration, setCompareDuration] =
    useState<CompareDuration>("week");

  const fallDateStr = fallDate ? toISODate(fallDate) : undefined;
  const selectedViewDateStr = selectedViewDate
    ? toISODate(selectedViewDate)
    : undefined;

  const {
    periodGaitData,
    selectedDateGaitData,
    fallAnalysis, // Updated from 'comparison' to match hook output
    loading,
    error,
  } = useHomeData(fallDateStr, "daily", selectedViewDateStr);

  const gaitData = periodGaitData;
  const hasData = periodGaitData !== null;

  const sectionTitle = selectedViewDate
    ? `Gait Metrics - ${formatDate(selectedViewDate)}`
    : "Today's Gait Metrics";

  const metrics = useMetrics(gaitData ?? {
    distance: 0, cadence: 0, swingSpeed: 0,
    heelImpact: 0, swingTime: 0, stanceTime: 0, stability: 0, totalSteps: 0,
  });

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <View>
            <ThemedText style={styles.title}>Overview</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              Gait analysis dashboard
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: cardColor }]}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={24} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        {loading && (
          <ActivityIndicator color={tintColor} style={{ marginBottom: 16 }} />
        )}
        {error && (
          <ThemedText style={{ color: Colors[scheme].error, marginBottom: 8 }}>
            {error}
          </ThemedText>
        )}

        {/* View date picker */}
        <View style={styles.viewDateRow}>
          <DatePickerField
            label="View date"
            value={selectedViewDate}
            placeholder="Today"
            onChange={setSelectedViewDate}
            onClear={() => setSelectedViewDate(null)}
          />
        </View>

        {/* Gait metrics */}
        <GaitMetricsSection
          title={sectionTitle}
          metrics={metrics}
          hasData={hasData}
        />

        {/* Before / After Fall Analysis */}
        <FallCompareSection
          fallDate={fallDate}
          onFallDateChange={setFallDate}
          onFallDateClear={() => setFallDate(null)}
          duration={compareDuration}
          onDurationChange={setCompareDuration}
          fallAnalysis={fallAnalysis} // Updated to match state name
          loading={loading}
        />
      </ScrollView>
    </View>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28 },
  subtitle: { fontSize: 13, marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  viewDateRow: {
    marginBottom: 12,
  },
});