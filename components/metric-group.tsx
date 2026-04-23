import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface MetricGroupProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function MetricGroup({ title, children, style }: MetricGroupProps) {
  const scheme = useColorScheme() ?? "light";
  const borderColor = Colors[scheme].border;
  const childArray = React.Children.toArray(children);

  return (
    <ThemedView
      style={[styles.container, style]}
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
    >
      <ThemedText style={[styles.title, { color: Colors[scheme].muted }]}>{title}</ThemedText>
      {childArray.map((child, index) => (
        <View key={index}>
          {index > 0 && (
            <View
              style={[styles.separator, { backgroundColor: borderColor }]}
            />
          )}
          {child}
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 14,
    overflow: "hidden",
    paddingTop: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
