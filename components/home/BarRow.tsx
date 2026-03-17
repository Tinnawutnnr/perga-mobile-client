import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, View } from "react-native";

interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
  valueStr: string;
}

const BarRow = ({ label, value, max, color, valueStr }: BarRowProps) => {
  const safeMax = Math.abs(max);
  const ratio = safeMax > 0 ? Math.min(Math.abs(value) / safeMax, 1) : 0;
  return (
    <View style={styles.row}>
      <ThemedText style={styles.sideLabel}>{label}</ThemedText>
      <View style={styles.trackWrap}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(ratio * 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
      <ThemedText style={[styles.value, { color }]}>{valueStr}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sideLabel: { fontSize: 12, opacity: 0.55, width: 36 },
  trackWrap: { flex: 1 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#33333318",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4 },
  value: { fontSize: 14, fontWeight: "700", width: 72, textAlign: "right" },
});

export default BarRow;
