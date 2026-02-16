import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import React from "react";
import { StyleSheet, View } from "react-native";

const ComparisonCard = ({ data }: { data: MetricDetailData }) => {
  const mutedColor = useThemeColor({}, "muted");

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Compared with others
      </ThemedText>
      <ThemedText style={{ fontSize: 13, color: mutedColor, marginBottom: 12 }}>
        {data.compareText}
      </ThemedText>
      <View style={styles.compareChart}>
        {data.compareBars.map((bar, index) => (
          <View
            key={index}
            style={[
              styles.compareBar,
              {
                height: 8 + bar * 8,
                backgroundColor: index === 4 ? "#5D7DDF" : "#34456F",
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.rangeRow}>
        <ThemedText style={{ fontSize: 11, color: mutedColor }}>
          Lesser
        </ThemedText>
        <ThemedText style={{ fontSize: 11, color: mutedColor }}>
          Greater
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  compareChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    gap: 6,
  },
  compareBar: { flex: 1, borderRadius: 3 },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default ComparisonCard;
