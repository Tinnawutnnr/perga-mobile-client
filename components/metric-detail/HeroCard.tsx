import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MetricDetailData } from "@/types/metric";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

function useStatusColor(colorStr: string): string {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const map: Record<string, string> = {
    success: C.success,
    warning: C.warning,
    error: C.error,
    info: C.info,
  };
  return map[colorStr] ?? colorStr;
}

const HeroCard = ({ data }: { data: MetricDetailData }) => {
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "muted");
  const statusColor = useStatusColor(data.statusColor);

  const [trackWidth, setTrackWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(data.progress, 0), 1);

  useEffect(() => {
    if (trackWidth > 0) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress > 0 ? Math.max(trackWidth * clampedProgress, 4) : 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [trackWidth, clampedProgress]);

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      {/* Value + unit */}
      <View style={styles.valueRow}>
        <ThemedText style={styles.value}>{data.value}</ThemedText>
        <ThemedText style={[styles.unit, { color: mutedColor }]}>
          {data.subValue}
        </ThemedText>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[styles.statusText, { color: statusColor }]}>
          {data.status}
        </ThemedText>
      </View>

      {/* Progress track */}
      <View
        style={[styles.track, { backgroundColor: borderColor }]}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.fill, { width: animatedWidth, backgroundColor: statusColor }]}
        />
      </View>

      <View style={styles.rangeRow}>
        <ThemedText style={[styles.rangeLabel, { color: mutedColor }]}>
          {data.minLabel}
        </ThemedText>
        <ThemedText style={[styles.rangeLabel, { color: mutedColor }]}>
          {data.maxLabel}
        </ThemedText>
      </View>
    </View>
  );
};

export default HeroCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  value: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 48,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
