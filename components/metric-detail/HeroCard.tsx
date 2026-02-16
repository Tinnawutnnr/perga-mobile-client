import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

const HeroCard = ({ data }: { data: MetricDetailData }) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <View style={styles.valueWrap}>
        <Ionicons name={data.iconName} size={28} color={data.statusColor} />
        <View style={styles.valueTextWrap}>
          <ThemedText type="title" style={{ fontSize: 24, lineHeight: 34 }}>
            {data.value}
          </ThemedText>
          <ThemedText
            style={{ fontSize: 14, color: mutedColor, marginBottom: 4 }}
          >
            {data.subValue}
          </ThemedText>
        </View>
      </View>

      <ThemedText
        type="defaultSemiBold"
        style={[styles.statusText, { color: data.statusColor }]}
      >
        {data.status}
      </ThemedText>

      <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(data.progress * 100, 100)}%`,
              backgroundColor: data.statusColor,
            },
          ]}
        />
      </View>

      <View style={styles.rangeRow}>
        <ThemedText style={{ fontSize: 12, color: mutedColor }}>
          {data.minLabel}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, color: mutedColor }}>
          {data.maxLabel}
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  valueTextWrap: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  statusText: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 14,
  },
  progressTrack: { height: 12, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  goalRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default HeroCard;
