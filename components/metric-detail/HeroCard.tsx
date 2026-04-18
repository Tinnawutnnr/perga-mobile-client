import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

const STATUS_COLOR: Record<string, string> = {
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
};

const resolveColor = (color: string): string => STATUS_COLOR[color] ?? color;

const HeroCard = ({ data }: { data: MetricDetailData }) => {
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const [trackWidth, setTrackWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.min(Math.max(data.progress, 0), 1);
  const statusColor = resolveColor(data.statusColor);

  useEffect(() => {
    if (trackWidth > 0) {
      const targetWidth =
        clampedProgress > 0 ? Math.max(trackWidth * clampedProgress, 4) : 0;

      Animated.timing(animatedWidth, {
        toValue: targetWidth,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }
  }, [trackWidth, clampedProgress]);

  return (
    <ThemedView style={styles.card} lightColor="#F8F9FA" darkColor="#1A1A1A">
      <View style={styles.valueWrap}>
        <Ionicons name={data.iconName} size={28} color={statusColor} />
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
        style={[styles.statusText, { color: statusColor }]}
      >
        {data.status}
      </ThemedText>

      <View
        style={[styles.progressTrack, { backgroundColor: borderColor }]}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={{
            width: animatedWidth,
            height: 12,
            backgroundColor: statusColor,
            borderRadius: 6,
          }}
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
  progressTrack: {
    height: 12,
    borderRadius: 6,
  },
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
