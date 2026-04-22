import { GaitMetricsSection } from "@/components/home/GaitMetricSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/fonts";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHomeData } from "@/hooks/use-home-data";
import { useMetrics } from "@/hooks/use-metrics";
import { useThemeColor } from "@/hooks/use-theme-color";
import { usePatientStore } from "@/store/patient-store";
import { Metric } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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

function isToday(d: Date) {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function formatDateLabel(d: Date) {
  if (isToday(d)) return "Today";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hexToRGBA(hex: string, alpha: number) {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Status summary ───────────────────────────────────────────────────────────

function getStatusSummary(
  metrics: Metric[],
  hasData: boolean,
  scheme: "light" | "dark",
) {
  const C = Colors[scheme];
  if (!hasData) {
    return {
      dotColor: C.muted,
      headline: "No walking data recorded",
      detail: null as string | null,
    };
  }
  const errorCount = metrics.filter((m) => m.statusColor === "error").length;
  const warningCount = metrics.filter((m) => m.statusColor === "warning").length;

  if (errorCount > 0) {
    const detail =
      warningCount > 0
        ? `${warningCount} further item${warningCount > 1 ? "s" : ""} to monitor`
        : null;
    return {
      dotColor: C.error,
      headline:
        errorCount === 1
          ? "One metric needs attention"
          : `${errorCount} metrics need attention`,
      detail,
    };
  }
  if (warningCount > 0) {
    return {
      dotColor: C.warning,
      headline:
        warningCount === 1
          ? "One metric to keep an eye on"
          : `${warningCount} metrics to keep an eye on`,
      detail: null as string | null,
    };
  }
  return {
    dotColor: C.tint,
    headline: "Walking pattern looks normal",
    detail: null as string | null,
  };
}

// ─── Date nav ─────────────────────────────────────────────────────────────────

function DateNav({
  date,
  onPrev,
  onNext,
  scheme,
}: {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  scheme: "light" | "dark";
}) {
  const C = Colors[scheme];
  const atToday = isToday(date);

  return (
    <View style={dateNavStyles.row}>
      <TouchableOpacity
        onPress={onPrev}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={dateNavStyles.arrow}
        accessibilityLabel="Previous day"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={20} color={C.tint} />
      </TouchableOpacity>

      <ThemedText style={dateNavStyles.label}>
        {formatDateLabel(date)}
      </ThemedText>

      <TouchableOpacity
        onPress={onNext}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={dateNavStyles.arrow}
        disabled={atToday}
        accessibilityLabel="Next day"
        accessibilityRole="button"
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={atToday ? C.muted : C.tint}
        />
      </TouchableOpacity>
    </View>
  );
}

const dateNavStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
    minWidth: 120,
    textAlign: "center",
  },
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const METRIC_ROW_COUNT = 7;

function HomeSkeleton({
  insetTop,
  cardColor,
  borderColor,
}: {
  insetTop: number;
  cardColor: string;
  borderColor: string;
}) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // eslint-disable-next-line react/no-unstable-nested-components
  const Bone = ({
    w,
    h,
    r = 6,
    style,
  }: {
    w: number | string;
    h: number;
    r?: number;
    style?: object;
  }) => (
    <Animated.View
      style={[
        // @ts-ignore — RN DimensionValue accepts string percentages
        { width: w, height: h, borderRadius: r, backgroundColor: borderColor, opacity: pulse },
        style,
      ]}
    />
  );

  return (
    <ScrollView
      style={skStyles.container}
      scrollEnabled={false}
      contentContainerStyle={{ paddingTop: insetTop + 8, paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={skStyles.headerRow}>
        <View style={{ gap: 8 }}>
          <Bone w={140} h={22} r={8} />
          <Bone w={90} h={13} r={6} />
        </View>
        <Bone w={40} h={40} r={20} />
      </View>

      {/* Date nav */}
      <View style={skStyles.dateNavRow}>
        <Bone w={36} h={36} r={18} />
        <Bone w={100} h={16} r={6} />
        <Bone w={36} h={36} r={18} />
      </View>

      {/* Status summary */}
      <Bone w="100%" h={54} r={12} style={{ marginBottom: 20 }} />

      {/* Metric group card */}
      <Bone w={80} h={11} r={5} style={{ marginBottom: 8, marginLeft: 2 }} />
      <View
        style={[
          skStyles.metricsCard,
          { backgroundColor: cardColor, borderColor, borderWidth: StyleSheet.hairlineWidth },
        ]}
      >
        {Array.from({ length: METRIC_ROW_COUNT }).map((_, i) => (
          <View key={i}>
            <View style={skStyles.metricRow}>
              {/* Left col */}
              <View style={skStyles.metricLeft}>
                <Bone w={110} h={13} r={5} />
                <Bone w={70} h={10} r={4} />
              </View>
              {/* Right col */}
              <Bone w={52} h={22} r={6} />
            </View>
            {i < METRIC_ROW_COUNT - 1 && (
              <View
                style={[
                  skStyles.divider,
                  { backgroundColor: borderColor },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const skStyles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  metricsCard: {
    borderRadius: 14,
    overflow: "hidden",
    paddingTop: 0,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  metricLeft: {
    flex: 1,
    gap: 7,
    paddingRight: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SummaryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const insets = useSafeAreaInsets();

  const { role, username } = useAuth();
  const { selectedPatient } = usePatientStore();

  const headerName =
    role === "caregiver" ? selectedPatient?.username : username;

  const [selectedViewDate, setSelectedViewDate] = useState<Date>(new Date());

  const selectedViewDateStr = toISODate(selectedViewDate);

  const {
    periodGaitData,
    loading,
    error,
    refresh: refreshHomeData,
  } = useHomeData(undefined, "daily", selectedViewDateStr);

  useFocusEffect(
    useCallback(() => {
      refreshHomeData();
    }, [refreshHomeData]),
  );

  const hasData = periodGaitData !== null;

  const metrics = useMetrics(
    periodGaitData ?? {
      distance: 0,
      cadence: 0,
      swingSpeed: 0,
      heelImpact: 0,
      swingTime: 0,
      stanceTime: 0,
      stability: 0,
      totalSteps: 0,
    },
  );

  const { dotColor, headline, detail } = getStatusSummary(
    metrics,
    hasData,
    scheme,
  );

  const handlePrevDay = () => {
    const d = new Date(selectedViewDate);
    d.setDate(d.getDate() - 1);
    setSelectedViewDate(d);
  };

  const handleNextDay = () => {
    if (isToday(selectedViewDate)) return;
    const d = new Date(selectedViewDate);
    d.setDate(d.getDate() + 1);
    setSelectedViewDate(d);
  };

  const borderColor = useThemeColor({}, "border");

  if (loading) {
    return (
      <View style={[styles.safeArea, { backgroundColor }]}>
        <HomeSkeleton
          insetTop={insets.top}
          cardColor={cardColor}
          borderColor={borderColor}
        />
      </View>
    );
  }

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
              Gait analysis
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

        {/* Date navigation */}
        <DateNav
          date={selectedViewDate}
          onPrev={handlePrevDay}
          onNext={handleNextDay}
          scheme={scheme}
        />

        {/* Status summary */}
        <View
          style={[
            styles.statusSummary,
            { backgroundColor: hexToRGBA(dotColor, 0.08) },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          <View style={styles.statusTextCol}>
            <ThemedText style={styles.statusHeadline}>{headline}</ThemedText>
            {detail && (
              <ThemedText style={[styles.statusDetail, { color: C.muted }]}>
                {detail}
              </ThemedText>
            )}
          </View>
        </View>

        {/* Gait metrics */}
        <GaitMetricsSection
          title="Gait Metrics"
          metrics={metrics}
          hasData={hasData}
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
  title: { fontSize: 28, fontWeight: "700", lineHeight: 28, fontFamily: Fonts.heading },
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
  // Status summary
  statusSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  statusTextCol: {
    flex: 1,
    gap: 2,
  },
  statusHeadline: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  statusDetail: {
    fontSize: 13,
  },
});
