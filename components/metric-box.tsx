import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface MetricBoxProps {
  /**
   * The label text displayed on the left (e.g., "SLEEP DURATION")
   */
  label: string;
  /**
   * The main value text (e.g., "7:31")
   */
  value?: string;
  /**
   * Optional sub-value displayed next to the value (e.g., "(13%)", "(2 times)")
   */
  subValue: string;
  /**
   * Status text displayed below the value (e.g., "OPTIMAL", "FAIR")
   */
  status: string;
  /**
   * Color for the status indicator square.
   * Can be a hex code or a key from schema (e.g. 'success', 'warning')
   */
  statusColor?: string;
  /**
   * Icon component to display on the left
   */
  icon?: React.ReactNode;

  style?: ViewStyle;
}

export function MetricBox({
  label,
  value,
  subValue,
  status,
  statusColor = Colors.light.success, // Default to success if not provided
  icon,
  style,
}: MetricBoxProps) {
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];

  // Resolve status color if it's one of the theme keys, otherwise use as is
  const resolvedStatusColor =
    statusColor in themeColors
      ? themeColors[statusColor as keyof typeof themeColors]
      : statusColor;

  return (
    <ThemedView
      style={[styles.container, style]}
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
    >
      <View style={styles.leftContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
        </ThemedText>
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.valueRow}>
          <ThemedText style={styles.value}>{value}</ThemedText>
          {subValue && (
            <ThemedText style={styles.subValue}>{subValue}</ThemedText>
          )}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: String(resolvedStatusColor) },
            ]}
          />
        </View>
        <ThemedText style={styles.statusText}>{status}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12, // Rounded corners as per design
    marginBottom: 12,
    // Add shadow/elevation if needed, though design looks flat/dark card
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    textTransform: "uppercase",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 24, // Large value text
    fontWeight: "600",
    lineHeight: 28,
  },
  subValue: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.7, // Muted look
    marginBottom: 2, // Alignment adjustment
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2, // Slight rounding for the square
    marginLeft: 8,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    textTransform: "uppercase",
    opacity: 0.6, // Dimmer text for status
  },
});
