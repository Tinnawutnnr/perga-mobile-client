import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import React from "react";
import { StyleSheet, View } from "react-native";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", ];

const WeeklyChartCard = ({
  data,
  maxWeekly,
}: {
  data: MetricDetailData;
  maxWeekly: number;
}) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Last 7 days
      </ThemedText>
      <View style={styles.weekChart}>
        {data.weekly.map((value, index) => (
          <View key={index} style={styles.barWrap}>
            <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
              <View
                style={[
                  styles.barValue,
                  {
                    height: `${(value / maxWeekly) * 100}%`,
                    backgroundColor:
                      index === data.weekly.length - 1 ? "#5D7DDF" : "#3A4A77",
                  },
                ]}
              />
            </View>
            <ThemedText
              style={{ fontSize: 11, color: mutedColor, marginTop: 4 }}
            >
              {WEEK_DAYS[index]}
            </ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  weekChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    gap: 8,
  },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barTrack: {
    width: "100%",
    height: 130,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barValue: { width: "100%", borderRadius: 6 },
});

export default WeeklyChartCard;
