import CompareCard from "@/components/home/CompareCard";
import SummaryBanner from "@/components/home/SummaryBanner";
import PeriodToggle from "@/components/home/TimePeriodToggle";
import { MetricBox } from "@/components/metric-box";
import { MetricGroup } from "@/components/metric-group";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { mockdata } from "@/data/mockGaitData";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Period, useHomeData } from "@/hooks/use-home-data";
import { useMetrics } from "@/hooks/use-metrics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const toISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const SummaryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const mutedColor = useThemeColor({}, "muted");
  const scheme = useColorScheme() ?? "light";

  const [fallDate, setFallDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [period, setPeriod] = useState<Period>("daily");

  const fallDateStr = fallDate ? toISODate(fallDate) : undefined;
  const { periodGaitData, comparison, loading, error } = useHomeData(
    fallDateStr,
    period,
  );

  const gaitData = periodGaitData ?? mockdata;

  const sectionTitle =
    period === "daily"
      ? "Today's Gait Metrics"
      : period === "weekly"
        ? "Weekly Average"
        : "Yearly Average";
  const metrics = useMetrics(gaitData);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (event.type === "set" && date) setFallDate(date);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
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

        {/* Period toggle */}
        <PeriodToggle value={period} onChange={setPeriod} />

        {/* Overall Metrics */}
        <MetricGroup title={sectionTitle}>
          {metrics.map((item, index) => (
            <MetricBox
              key={index}
              label={item.label}
              value={item.value}
              subValue={item.subValue}
              status={item.status}
              statusColor={item.statusColor || "success"}
              icon={
                <Ionicons name={item.iconName} size={24} color={iconColor} />
              }
              onPress={item.onPress}
            />
          ))}
        </MetricGroup>

        {/* Before / After Fall */}
        <ThemedText style={styles.sectionTitle}>
          Before vs After Fall
        </ThemedText>
        <ThemedText type="muted" style={styles.sectionDesc}>
          Compares the 7-day average before and after the selected fall date.
        </ThemedText>

        {/* Date picker button */}
        {/* Date picker button */}
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 12 }}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: cardColor, flex: 1 }]}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.dateIconWrap,
                { backgroundColor: tintColor + "22" },
              ]}
            >
              <Ionicons name="calendar-outline" size={18} color={tintColor} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 11, opacity: 0.5 }}>
                Fall date
              </ThemedText>
              <ThemedText
                style={{ fontSize: 14, fontWeight: "600", color: tintColor }}
              >
                {fallDate ? formatDate(fallDate) : "Tap to select"}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={mutedColor} />
          </TouchableOpacity>

          {fallDate && (
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: cardColor }]}
              onPress={() => setFallDate(null)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close-outline"
                size={24}
                color={Colors[scheme].error}
              />
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          <DateTimePicker
            value={fallDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Summary banner + cards */}
        {fallDate && comparison.length > 0 && (
          <View style={{ marginTop: 16 }}>
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
      </ScrollView>
    </SafeAreaView>
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
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sectionDesc: { fontSize: 12, marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  dateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
  },
  resetButton: {
    width: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
