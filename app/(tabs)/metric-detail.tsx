import ArticleCard from "@/components/metric-detail/ArticleCard";
import CompareButton from "@/components/metric-detail/CompareButton";
import ComparisonCard from "@/components/metric-detail/ComparisonCard";
import HeroCard from "@/components/metric-detail/HeroCard";
import WeeklyChartCard from "@/components/metric-detail/WeeklyChartCard";
import { ThemedText } from "@/components/themed-text";
import { useMetricDetail } from "@/hooks/use-metric-detail";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const Header = ({ title }: { title: string }) => {
  const textColor = useThemeColor({}, "text");
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={textColor} />
      </TouchableOpacity>
      <ThemedText type="subtitle" style={styles.headerTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={{ width: 24 }} />
    </View>
  );
};

const MetricDetailScreen = () => {
  const { label, data, maxWeekly } = useMetricDetail();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        <Header title={label} />
        <HeroCard data={data} />
        <WeeklyChartCard data={data} maxWeekly={maxWeekly} />
        <ComparisonCard data={data} />
        <CompareButton label={label} />
        <ArticleCard data={data} />
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MetricDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    letterSpacing: 0.6,
  },
});
