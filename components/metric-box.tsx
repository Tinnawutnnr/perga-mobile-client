import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  type GestureResponderEvent,
} from "react-native";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface MetricBoxProps {
  label: string;
  value?: string;
  subValue: string;
  status: string;
  statusColor?: string;
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

export function MetricBox({
  label,
  value,
  subValue,
  status,
  statusColor = Colors.light.success,
  icon,
  onPress,
  style,
}: MetricBoxProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];
  const resolvedStatusColor =
    statusColor in themeColors
      ? themeColors[statusColor as keyof typeof themeColors]
      : statusColor;

  const isPressable = Boolean(onPress);

  return (
    <ThemedView
      style={[styles.container, style]}
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
    >
      {/* Left accent bar */}
      <View
        style={[
          styles.accentBar,
          { backgroundColor: String(resolvedStatusColor) },
        ]}
      />
      <TouchableOpacity
        style={styles.content}
        disabled={!isPressable}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon */}
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: String(resolvedStatusColor) + "18" },
            ]}
          >
            {icon}
          </View>
        )}

        {/* Label */}
        <View style={styles.labelBlock}>
          <ThemedText style={styles.label}>{label}</ThemedText>
          {/* Status pill */}
          <View
            style={[
              styles.statusPill,
              { backgroundColor: String(resolvedStatusColor) + "22" },
            ]}
          >
            <ThemedText
              style={[
                styles.statusText,
                { color: String(resolvedStatusColor) },
              ]}
            >
              {status}
            </ThemedText>
          </View>
        </View>

        {/* Value block */}
        <View style={styles.rightContainer}>
          <View style={styles.valueRow}>
            <ThemedText style={styles.value}>{value}</ThemedText>
            {subValue && (
              <ThemedText style={styles.subValue}>{subValue}</ThemedText>
            )}
          </View>
          {isPressable && (
            <ThemedText
              style={[styles.tapHint, { color: String(resolvedStatusColor) }]}
            >
              Details
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    borderRadius: 0,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  labelBlock: {
    flex: 1,
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 30,
  },
  subValue: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: "500",
  },
  tapHint: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
  },
});
