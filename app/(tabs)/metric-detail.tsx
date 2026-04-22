import ArticleCard from "@/components/metric-detail/ArticleCard";
import ComparisonCard from "@/components/metric-detail/ComparisonCard";
import HeroCard from "@/components/metric-detail/HeroCard";
import OtherCompareCard from "@/components/metric-detail/OtherCompareCard";
import SelfCompareCard from "@/components/metric-detail/SelfCompareCard";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/fonts";
import { CompareMode, useMetricCompare } from "@/hooks/use-metric-compare";
import { useMetricDetail } from "@/hooks/use-metric-detail";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Mode toggle ──────────────────────────────────────────────────────────────

const MODES: { key: CompareMode; label: string }[] = [
  { key: "self", label: "Self" },
  { key: "others", label: "Peers" },
];

const ModeToggle = ({
  mode,
  onModeChange,
}: {
  mode: CompareMode;
  onModeChange: (m: CompareMode) => void;
}) => {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View style={[styles.modeToggle, { backgroundColor: cardColor, borderColor }]}>
      {MODES.map((m) => {
        const active = m.key === mode;
        return (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, active && { backgroundColor: tintColor }]}
            onPress={() => onModeChange(m.key)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
          >
            <ThemedText
              style={[styles.modeBtnText, { color: active ? "#fff" : mutedColor }]}
            >
              {m.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── State cards ──────────────────────────────────────────────────────────────

const LoadingCard = () => {
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  return (
    <View style={styles.stateBox}>
      <ActivityIndicator size="small" color={tintColor} />
      <ThemedText style={[styles.stateText, { color: mutedColor }]}>
        Loading…
      </ThemedText>
    </View>
  );
};

const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => {
  const mutedColor = useThemeColor({}, "muted");
  const tintColor = useThemeColor({}, "tint");
  return (
    <View style={styles.stateBox}>
      <Ionicons name="alert-circle-outline" size={24} color={mutedColor} />
      <ThemedText style={[styles.stateText, { color: mutedColor }]}>
        {message}
      </ThemedText>
      <TouchableOpacity
        style={[styles.retryBtn, { borderColor: tintColor }]}
        onPress={onRetry}
        accessibilityRole="button"
      >
        <ThemedText style={[styles.retryText, { color: tintColor }]}>
          Retry
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

// ─── Compare section ──────────────────────────────────────────────────────────

const MetricCompareSection = () => {
  const {
    mode, setMode,
    range, setRange,
    isLoading, error, refetch,
    selfBars, maxSelf, unit,
    benchmarkBar, benchmarkLoading, benchmarkError, refetchBenchmark,
  } = useMetricCompare();

  const mutedColor = useThemeColor({}, "muted");
  const activeLoading = mode === "self" ? isLoading : benchmarkLoading;
  const activeError   = mode === "self" ? error     : benchmarkError;
  const activeRetry   = mode === "self" ? refetch   : refetchBenchmark;

  return (
    <>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <ThemedText style={[styles.modeHint, { color: mutedColor }]}>
        {mode === "self"
          ? "Your metric values over time"
          : "How you compare to your peer group"}
      </ThemedText>

      {activeLoading ? (
        <LoadingCard />
      ) : activeError ? (
        <ErrorCard message={activeError} onRetry={activeRetry} />
      ) : mode === "self" ? (
        <SelfCompareCard
          bars={selfBars}
          maxValue={maxSelf}
          unit={unit}
          range={range}
          onRangeChange={setRange}
        />
      ) : benchmarkBar ? (
        <>
          <OtherCompareCard bar={benchmarkBar} unit={unit} />
          <ComparisonCard bar={benchmarkBar} unit={unit} />
        </>
      ) : (
        <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
          No benchmark data available.
        </ThemedText>
      )}
    </>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const MetricDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const { label, data } = useMetricDetail();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{label}</ThemedText>
            <ThemedText type="muted" style={styles.headerSub}>
              Gait metric detail
            </ThemedText>
          </View>
        </View>

        {/* Hero */}
        <HeroCard data={data} />

        {/* Compare section */}
        <MetricCompareSection />

        {/* Article */}
        <ArticleCard data={data} />
      </ScrollView>
    </View>
  );
};

export default MetricDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 28,
    fontFamily: Fonts.heading,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    marginBottom: 8,
    gap: 2,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 14,
  },

  // State cards
  stateBox: {
    borderRadius: 14,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  stateText: {
    fontSize: 13,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: 24,
  },
});
