import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import AnomalyChart from "../../components/anomaly-chart";
import DistanceChart from "../../components/distance-chart";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { useThemeColor } from "../../hooks/use-theme-color";

// Mock data with daily distances and anomalies
const monthlyData = [
  {
    month: "Jan",
    anomaly: 0,
    distance: 12,
    monthName: "January 2025",
    dailyDistances: [0.5, 0.3, 0.4, 0.8, 0.6, 0.4, 0.5, 0.3, 0.7, 0.4, 0.5, 0.3, 0.4, 0.9, 0.5, 0.3, 0.4, 0.6, 0.5, 0.4, 0.8, 0.2, 0.4, 0.5, 0.3, 0.7, 0.4, 0.5, 0.3, 0.6, 0.4],
    dailyAnomalies: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Feb",
    anomaly: 2,
    distance: 18,
    monthName: "February 2025",
    dailyDistances: [0.6, 0.7, 0.5, 0.8, 0.6, 0.7, 1.2, 0.9, 0.6, 0.5, 0.7, 0.8, 0.6, 1.1, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6, 0.5, 0.8, 0.7, 0.6, 1.3, 0.7, 0.8, 0.6],
    dailyAnomalies: [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Mar",
    anomaly: 1,
    distance: 21,
    monthName: "March 2025",
    dailyDistances: [0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 1.0, 0.7, 1.4, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7, 0.9, 0.6, 0.8, 0.7, 0.6, 0.9, 0.8, 1.2, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7],
    dailyAnomalies: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Apr",
    anomaly: 3,
    distance: 25,
    monthName: "April 2025",
    dailyDistances: [0.8, 0.9, 0.7, 1.0, 0.8, 0.9, 0.7, 1.1, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9, 0.8, 1.0, 0.7, 0.9, 0.8, 0.7, 1.0, 0.9, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9],
    dailyAnomalies: [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "May",
    anomaly: 2,
    distance: 19,
    monthName: "May 2025",
    dailyDistances: [0.6, 0.7, 0.5, 0.8, 0.6, 0.7, 0.5, 0.9, 0.6, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6, 0.5, 0.8, 0.7, 0.6, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6],
    dailyAnomalies: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Jun",
    anomaly: 1,
    distance: 23,
    monthName: "June 2025",
    dailyDistances: [0.8, 0.9, 0.7, 1.0, 0.8, 0.9, 0.7, 1.1, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9, 0.8, 1.0, 0.7, 0.9, 0.8, 0.7, 1.0, 0.9, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9],
    dailyAnomalies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Jul",
    anomaly: 4,
    distance: 28,
    monthName: "July 2025",
    dailyDistances: [0.9, 1.0, 0.8, 1.1, 0.9, 1.0, 0.8, 1.2, 0.9, 0.8, 1.0, 1.1, 0.9, 0.8, 1.0, 0.9, 1.1, 0.8, 1.0, 0.9, 0.8, 1.1, 1.0, 0.9, 0.8, 1.0, 1.1, 0.9, 0.8, 1.0, 0.9],
    dailyAnomalies: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Aug",
    anomaly: 2,
    distance: 22,
    monthName: "August 2025",
    dailyDistances: [0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 1.0, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7, 0.9, 0.6, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7],
    dailyAnomalies: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Sep",
    anomaly: 0,
    distance: 17,
    monthName: "September 2025",
    dailyDistances: [0.5, 0.6, 0.4, 0.7, 0.5, 0.6, 0.4, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.6, 0.5, 0.7, 0.4, 0.6, 0.5, 0.4, 0.7, 0.6, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.6],
    dailyAnomalies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Oct",
    anomaly: 1,
    distance: 20,
    monthName: "October 2025",
    dailyDistances: [0.6, 0.7, 0.5, 0.8, 0.6, 0.7, 0.5, 0.9, 0.6, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6, 0.5, 0.8, 0.7, 0.6, 0.5, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6],
    dailyAnomalies: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Nov",
    anomaly: 3,
    distance: 24,
    monthName: "November 2025",
    dailyDistances: [0.8, 0.9, 0.7, 1.0, 0.8, 0.9, 0.7, 1.1, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9, 0.8, 1.0, 0.7, 0.9, 0.8, 0.7, 1.0, 0.9, 0.8, 0.7, 0.9, 1.0, 0.8, 0.7, 0.9],
    dailyAnomalies: [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    month: "Dec",
    anomaly: 2,
    distance: 21,
    monthName: "December 2025",
    dailyDistances: [0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 1.0, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7, 0.9, 0.6, 0.8, 0.7, 0.6, 0.9, 0.8, 0.7, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.7],
    dailyAnomalies: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

const SummaryScreen = () => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(10); // November as defualt

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const mutedColor = useThemeColor({}, 'muted');

  const selectedMonth = monthlyData[selectedMonthIndex];
  const totalAnomalies = monthlyData.reduce((sum, month) => sum + month.anomaly, 0);
  const totalDistance = monthlyData.reduce((sum, month) => sum + month.distance, 0);
  const avgDistance = totalDistance / monthlyData.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.headerRow}>
          <ThemedText style={styles.title}>Summary</ThemedText>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: cardColor }]}>
            <Ionicons name="person" size={24} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        {/* Summary cards */}
        <ThemedView style={styles.summaryContainer}>
          <ThemedView style={[styles.summaryCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="muted" style={styles.summaryTitle}>Anomaly</ThemedText>
            <ThemedText style={styles.summaryValue}>{totalAnomalies}</ThemedText>
            <ThemedText type="muted" style={styles.summaryUnit}>time</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.summaryCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="muted" style={styles.summaryTitle}>Distance</ThemedText>
            <ThemedText style={styles.summaryValue}>{totalDistance.toFixed(1)}</ThemedText>
            <ThemedText type="muted" style={styles.summaryUnit}>km</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.summaryCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="muted" style={styles.summaryTitle}>avgDistance</ThemedText>
            <ThemedText style={styles.summaryValue}>{avgDistance.toFixed(2)}</ThemedText>
            <ThemedText type="muted" style={styles.summaryUnit}>km/day</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Month Slider */}
        <ThemedView style={styles.monthSliderContainer}>
          <ThemedText style={styles.monthSliderTitle}>Select Month</ThemedText>
          <FlatList
            data={monthlyData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.monthSliderContent}
            renderItem={({ item, index }) => {
              const isSelected = index === selectedMonthIndex;
              return (
                <TouchableOpacity
                  style={[
                    styles.monthItem,
                    { backgroundColor: cardColor },
                    isSelected && [styles.monthItemSelected, { backgroundColor: tintColor }]
                  ]}
                  onPress={() => setSelectedMonthIndex(index)}
                >
                  <ThemedText
                    style={[
                      styles.monthText,
                      { color: mutedColor },
                      isSelected && styles.monthTextSelected,
                    ]}
                  >
                    {item.month}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
          />
          <ThemedText style={styles.selectedMonthName}>{selectedMonth.monthName}</ThemedText>
        </ThemedView>

        {/* Current Month Stats */}
        <ThemedView style={styles.currentMonthStats}>
          <ThemedView style={[styles.monthStatCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="muted" style={styles.monthStatLabel}>This Month Anomaly</ThemedText>
            <ThemedText style={styles.monthStatValue}>{selectedMonth.anomaly}</ThemedText>
            <ThemedText type="muted" style={styles.monthStatUnit}>time</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.monthStatCard, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="muted" style={styles.monthStatLabel}>This Month Distance</ThemedText>
            <ThemedText style={styles.monthStatValue}>{selectedMonth.distance}</ThemedText>
            <ThemedText type="muted" style={styles.monthStatUnit}>km</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Charts */}
        <DistanceChart data={selectedMonth.dailyDistances} maxValue={2.0} />
        <AnomalyChart data={selectedMonth.dailyAnomalies} maxValue={4} />
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
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryUnit: {
    fontSize: 12,
    fontWeight: "400",
  },
  monthSliderContainer: {
    marginBottom: 20,
  },
  monthSliderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  monthSliderContent: {
    paddingHorizontal: 10,
  },
  monthItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  monthItemSelected: {
    // backgroundColor will be applied dynamically
  },
  monthText: {
    fontSize: 14,
    fontWeight: "500",
  },
  monthTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  selectedMonthName: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  currentMonthStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  monthStatCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  monthStatLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  monthStatValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  monthStatUnit: {
    fontSize: 11,
    fontWeight: "400",
  },
});