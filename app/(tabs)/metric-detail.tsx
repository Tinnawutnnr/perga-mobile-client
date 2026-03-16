import ArticleCard from "@/components/metric-detail/ArticleCard";
import HeroCard from "@/components/metric-detail/HeroCard";
import OtherCompareCard from "@/components/metric-detail/OtherCompareCard";
import SelfCompareCard from "@/components/metric-detail/SelfCompareCard";
import { CompareMode, useMetricCompare } from "@/hooks/use-metric-compare";
import { ThemedText } from "@/components/themed-text";
import { useMetricDetail } from "@/hooks/use-metric-detail";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const MODES: { key: CompareMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "self", label: "Self Compare", icon: "person-outline" },
  { key: "others", label: "Peer Compare", icon: "people-outline" },
];

const Header = ({ title }: { title: string }) => {
  const textColor = useThemeColor({}, "text");
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={textColor} />
      </TouchableOpacity>
      <ThemedText type="subtitle" style={styles.headerTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={{ width: 24 }} />
    </View>
  );
};

const ModeToggle = ({
  mode,
  onModeChange,
}: {
  mode: CompareMode;
  onModeChange: (m: CompareMode) => void;
}) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View style={[styles.modeToggle, { borderColor }]}>
      {MODES.map((m) => {
        const active = m.key === mode;
        return (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, active && styles.modeBtnActive]}
            onPress={() => onModeChange(m.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={m.icon}
              size={15}
              color={active ? "#fff" : mutedColor}
              style={{ marginRight: 5 }}
            />
            <ThemedText
              style={[
                styles.modeBtnText,
                { color: active ? "#fff" : mutedColor },
              ]}
            >
              {m.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const LoadingCard = () => (
  <View style={styles.stateCard}>
    <ActivityIndicator size="small" color="#5D7DDF" />
    <ThemedText style={{ fontSize: 13, marginTop: 10, opacity: 0.5 }}>
      Loading data…
    </ThemedText>
  </View>
);

const ErrorCard = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const mutedColor = useThemeColor({}, "muted");

  return (
    <View style={styles.stateCard}>
      <Ionicons name="alert-circle-outline" size={28} color="#FF9800" />
      <ThemedText
        style={{
          fontSize: 13,
          color: mutedColor,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {message}
      </ThemedText>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <ThemedText style={{ fontSize: 13, color: "#5D7DDF", fontWeight: "600" }}>
          Retry
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const MetricCompareSection = () => {
  const {
    mode,
    setMode,
    range,
    setRange,
    isLoading,
    error,
    refetch,
    metricInfo,
    selfBars,
    maxSelf,
    otherBar,
  } = useMetricCompare();

  const mutedColor = useThemeColor({}, "muted");

  return (
    <>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <ThemedText style={[styles.modeSubtitle, { color: mutedColor }]}> 
        {mode === "self"
          ? "Your metric values over time"
          : "How you compare to your peer group"}
      </ThemedText>

      {isLoading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error} onRetry={refetch} />
      ) : mode === "self" ? (
        <SelfCompareCard
          bars={selfBars}
          maxValue={maxSelf}
          unit={metricInfo?.unit ?? ""}
          range={range}
          onRangeChange={setRange}
        />
      ) : otherBar ? (
        <OtherCompareCard bar={otherBar} unit={metricInfo?.unit ?? ""} />
      ) : null}

      <View style={{ height: 20 }} />
    </>
  );
};

const MetricDetailScreen = () => {
  const { label, data } = useMetricDetail();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        <Header title={label} />
        <HeroCard data={data} />
        <MetricCompareSection />
        <ArticleCard data={data} />
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MetricDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    letterSpacing: 0.6,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  modeToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  modeBtnActive: {
    backgroundColor: "#5D7DDF",
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modeSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  stateCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5D7DDF",
  },
});
