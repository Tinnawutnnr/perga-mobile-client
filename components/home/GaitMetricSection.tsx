import { MetricBox } from "@/components/metric-box";
import { MetricGroup } from "@/components/metric-group";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Metric } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GaitMetricsSectionProps {
  title: string;
  metrics: Metric[];
  hasData: boolean;
}

export function GaitMetricsSection({
  title,
  metrics,
  hasData,
}: GaitMetricsSectionProps) {
  const iconColor = useThemeColor({}, "icon");

  return (
    <MetricGroup title={title}>
      {!hasData ? (
        <View style={styles.noDataRow}>
          <ThemedText style={styles.noDataDash}>--</ThemedText>
          <ThemedText type="muted" style={styles.noDataText}>
            No data available for this date.
          </ThemedText>
        </View>
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
            icon={<Ionicons name={item.iconName} size={24} color={iconColor} />}
            onPress={item.onPress}
          />
        ))
      )}
    </MetricGroup>
  );
}

const styles = StyleSheet.create({
  noDataRow: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noDataDash: {
    fontSize: 32,
    fontWeight: "700",
    opacity: 0.3,
  },
  noDataText: {
    fontSize: 13,
    marginTop: 4,
  },
});
