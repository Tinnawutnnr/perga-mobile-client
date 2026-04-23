import { MetricBox } from "@/components/metric-box";
import { MetricGroup } from "@/components/metric-group";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Metric } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GaitMetricsSectionProps {
  title: string;
  metrics: Metric[];
  hasData: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function NoDataState() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  return (
    <View style={stateStyles.container}>
      <Ionicons
        name="footsteps-outline"
        size={30}
        color={C.tint}
        style={{ opacity: 0.4 }}
      />
      <View style={stateStyles.textBlock}>
        <Text style={[stateStyles.headline, { color: C.text }]}>
          No walks recorded
        </Text>
        <Text style={[stateStyles.body, { color: C.muted }]}>
          Wear your sensor and walk to capture gait data for this day.
        </Text>
      </View>
    </View>
  );
}

function FetchErrorState({ onRetry }: { onRetry?: () => void }) {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  return (
    <View style={stateStyles.container}>
      <Ionicons
        name="cloud-offline-outline"
        size={30}
        color={C.error}
        style={{ opacity: 0.55 }}
      />
      <View style={stateStyles.textBlock}>
        <Text style={[stateStyles.headline, { color: C.text }]}>
          Couldn't load data
        </Text>
        <Text style={[stateStyles.body, { color: C.muted }]}>
          Check your connection, then try again.
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={stateStyles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry loading data"
        >
          <Text style={[stateStyles.retryText, { color: C.tint }]}>
            Try again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function GaitMetricsSection({
  title,
  metrics,
  hasData,
  error,
  onRetry,
}: GaitMetricsSectionProps) {
  return (
    <MetricGroup title={title}>
      {error ? (
        <FetchErrorState onRetry={onRetry} />
      ) : !hasData ? (
        <NoDataState />
      ) : (
        metrics.map((item, index) => (
          <MetricBox
            key={index}
            label={item.label}
            infoText={item.infoText}
            value={item.value}
            subValue={item.subValue}
            status={item.status}
            statusColor={item.statusColor || "success"}
            onPress={item.onPress}
          />
        ))
      )}
    </MetricGroup>
  );
}

const stateStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 12,
  },
  textBlock: {
    alignItems: "center",
    gap: 6,
  },
  headline: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 240,
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
