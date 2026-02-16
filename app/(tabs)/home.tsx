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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { mockdata } from "@/data/mockGaitData";

const SummaryScreen = () => {
  const colorScheme = useColorScheme();
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const iconColor = Colors[colorScheme ?? "light"].icon;

  const data = mockdata;
  const openMetricDetail = (label: string) => {
    router.push({
      pathname: "/(tabs)/metric-detail",
      params: { label },
    });
  };

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
          <MetricBox
            label="Cadence"
            value={data.cadence.toString()}
            subValue="steps/min"
            status="Optimal"
            statusColor="success"
            icon={<Ionicons name="timer-outline" size={24} color={iconColor} />}
            onPress={() => openMetricDetail("Cadence")}
          />

          <MetricBox
            label="Total Steps"
            value={`${Math.floor(data.distance * 1312).toLocaleString()}`}
            subValue="steps"
            status={data.distance > 20 ? "Goal Hit" : "Keep Going"}
            statusColor={data.distance > 20 ? "success" : "warning"}
            icon={<Ionicons name="walk-outline" size={24} color={iconColor} />}
            onPress={() => openMetricDetail("Total Steps")}
          />

          <MetricBox
            label="Calories"
            value={`${Math.floor(data.distance * 65)}`}
            subValue="kcal"
            status="Good Burn"
            statusColor="success"
            icon={<Ionicons name="flame-outline" size={24} color={iconColor} />}
            onPress={() => openMetricDetail("Calories")}
          />

          <MetricBox
            label="Swing Speed"
            value={data.swingSpeed.toString()}
            subValue="deg/s"
            status="Strong"
            statusColor="success"
            icon={
              <Ionicons
                name="speedometer-outline"
                size={24}
                color={iconColor}
              />
            }
            onPress={() => openMetricDetail("Swing Speed")}
          />

          <MetricBox
            label="Heel Impact"
            value={data.heelImpact.toString()}
            subValue="g"
            status="Normal"
            statusColor="success"
            icon={
              <Ionicons name="footsteps-outline" size={24} color={iconColor} />
            }
            onPress={() => openMetricDetail("Heel Impact")}
          />

          <MetricBox
            label="Step Duration"
            value={data.stepDuration.toString()}
            subValue="s"
            status="Normal"
            statusColor="success"
            icon={
              <Ionicons name="hourglass-outline" size={24} color={iconColor} />
            }
            onPress={() => openMetricDetail("Step Duration")}
          />

          <MetricBox
            label="Stability"
            value={data.stability + "%"}
            subValue="(CV)"
            status="Stable"
            statusColor="success"
            icon={
              <Ionicons name="analytics-outline" size={24} color={iconColor} />
            }
            onPress={() => openMetricDetail("Stability")}
          />
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
