import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../constants/theme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface MetricGroupProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function MetricGroup({ title, children, style }: MetricGroupProps) {
  return (
    <ThemedView
      style={[styles.container, style]}
      lightColor={Colors.light.cardborder} // Or a specific light section color
      darkColor={Colors.dark.cardborder} // Slightly darker than the cards inside (#1A1A1A)
    >
      <ThemedText style={styles.title}>{title}</ThemedText>
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: "100%",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden", // Ensure children respect radius
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
    opacity: 0.7,
    marginLeft: 4,
  },
  content: {
    gap: 0,
  },
});
