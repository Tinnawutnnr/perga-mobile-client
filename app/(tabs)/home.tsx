import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MetricBox } from "@/components/metric-box";
import { MetricGroup } from "@/components/metric-group";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { mockdata } from "@/data/mockGaitData";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMetrics } from "@/hooks/use-metrics";

const SummaryScreen = () => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const metrics = useMetrics(mockdata);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <ThemedText style={styles.title}>Home</ThemedText>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: cardColor }]}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={24} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        {/* Charts */}
        <MetricGroup title="Gait Metrics">
          {metrics.map((item, index) => (
            <MetricBox
              key={index}
              label={item.label}
              value={item.value}
              subValue={item.subValue}
              status={item.status}
              statusColor={item.statusColor || "success"}
              icon={
                <Ionicons 
                  name={item.iconName} 
                  size={24} 
                  color={iconColor} 
                />
              }
              onPress={item.onPress}
            />
          ))}
        </MetricGroup>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
