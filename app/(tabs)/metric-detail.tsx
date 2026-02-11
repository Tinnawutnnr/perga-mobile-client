import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { clamp, useMetricLayout } from "../../hooks/use-metric-layout";
import { useThemeColor } from "../../hooks/use-theme-color";

type MetricDetailData = {
  value: string;
  subValue: string;
  status: string;
  statusColor: string;
  minLabel: string;
  maxLabel: string;
  goalLabel: string;
  progress: number;
  weekly: number[];
  compareText: string;
  compareBars: number[];
  articleTitle: string;
  articleBody: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const METRIC_DETAIL_MAP: Record<string, MetricDetailData> = {
  Cadence: {
    value: "108",
    subValue: "steps/min",
    status: "Optimal",
    statusColor: "#4CAF50",
    minLabel: "70",
    maxLabel: "130",
    goalLabel: "Goal 110",
    progress: 0.9,
    weekly: [102, 99, 95, 106, 111, 109, 108],
    compareText: "Your cadence is faster than 68% of users.",
    compareBars: [2, 3, 5, 6, 6, 4, 3, 2, 1, 1],
    articleTitle: "Why Cadence Matters",
    articleBody:
      "Cadence reflects how many steps you take per minute. A consistent cadence can improve gait efficiency and reduce unnecessary joint loading.",
    icon: "timer-outline",
  },
  "Total Steps": {
    value: "32,800",
    subValue: "steps",
    status: "Goal Hit",
    statusColor: "#4CAF50",
    minLabel: "0",
    maxLabel: "40k",
    goalLabel: "Goal 30k",
    progress: 0.82,
    weekly: [4200, 3900, 3700, 4600, 5100, 5400, 5900],
    compareText: "Your total steps are higher than 74% of users.",
    compareBars: [2, 2, 3, 4, 6, 7, 5, 3, 2, 1],
    articleTitle: "Building Daily Step Volume",
    articleBody:
      "Step volume is a simple indicator of activity level. Keeping a stable weekly trend is often more useful than chasing one very high day.",
    icon: "walk-outline",
  },
  Calories: {
    value: "1,235",
    subValue: "kcal",
    status: "Good Burn",
    statusColor: "#4CAF50",
    minLabel: "0",
    maxLabel: "1.5k",
    goalLabel: "Goal 1.2k",
    progress: 0.82,
    weekly: [150, 142, 139, 175, 190, 210, 229],
    compareText: "Your calories burned are above 65% of users.",
    compareBars: [2, 3, 4, 6, 7, 5, 4, 2, 1, 1],
    articleTitle: "Calories and Walking",
    articleBody:
      "Calorie burn follows your movement amount and intensity. A balanced plan combines regular walking time with manageable effort.",
    icon: "flame-outline",
  },
  "Swing Speed": {
    value: "300",
    subValue: "deg/s",
    status: "Strong",
    statusColor: "#4CAF50",
    minLabel: "150",
    maxLabel: "350",
    goalLabel: "Goal 280",
    progress: 0.86,
    weekly: [280, 275, 268, 291, 305, 299, 300],
    compareText: "Your swing speed is stronger than 70% of users.",
    compareBars: [1, 2, 4, 5, 7, 6, 4, 3, 2, 1],
    articleTitle: "Understanding Swing Speed",
    articleBody:
      "Swing speed describes how quickly your leg moves through the swing phase. Healthy values support fluid gait and timing symmetry.",
    icon: "speedometer-outline",
  },
  "Heel Impact": {
    value: "2.5",
    subValue: "g",
    status: "Normal",
    statusColor: "#4CAF50",
    minLabel: "0",
    maxLabel: "4.0",
    goalLabel: "Goal < 3.0",
    progress: 0.63,
    weekly: [2.1, 2.3, 2.4, 2.6, 2.7, 2.6, 2.5],
    compareText: "Your heel impact is lower than 62% of users.",
    compareBars: [6, 7, 6, 5, 4, 3, 2, 2, 1, 1],
    articleTitle: "Managing Heel Impact",
    articleBody:
      "Lower heel impact can reduce repetitive stress. Footwear, pace, and stride length all influence impact intensity.",
    icon: "footsteps-outline",
  },
  "Step Duration": {
    value: "1.1",
    subValue: "s",
    status: "Normal",
    statusColor: "#4CAF50",
    minLabel: "0.8",
    maxLabel: "1.4",
    goalLabel: "Goal 1.0",
    progress: 0.75,
    weekly: [1.08, 1.11, 1.14, 1.09, 1.07, 1.1, 1.1],
    compareText: "Your step duration is balanced vs 59% of users.",
    compareBars: [2, 4, 5, 7, 6, 4, 3, 2, 1, 1],
    articleTitle: "Step Duration Basics",
    articleBody:
      "Step duration measures the time for one step cycle. Consistent timing is often linked to stable gait control.",
    icon: "hourglass-outline",
  },
  Stability: {
    value: "98",
    subValue: "%",
    status: "Stable",
    statusColor: "#4CAF50",
    minLabel: "70%",
    maxLabel: "100%",
    goalLabel: "Goal > 95%",
    progress: 0.98,
    weekly: [95, 94, 93, 96, 97, 98, 98],
    compareText: "Your gait stability is higher than 82% of users.",
    compareBars: [1, 2, 2, 3, 4, 6, 7, 6, 4, 2],
    articleTitle: "Why Stability Is Critical",
    articleBody:
      "Stability represents control and consistency during movement. Higher stability can correlate with safer and more efficient walking.",
    icon: "analytics-outline",
  },
};

const WEEK_DAYS = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

const MetricDetailScreen = () => {
  const layout = useMetricLayout();
  const { label } = useLocalSearchParams<{ label?: string }>();
  const metricLabel = typeof label === "string" ? label : "Cadence";
  const metricData =
    METRIC_DETAIL_MAP[metricLabel] ?? METRIC_DETAIL_MAP.Cadence;
  const maxWeekly = Math.max(...metricData.weekly);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "muted");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor, paddingHorizontal: layout.horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons
              name="chevron-back"
              size={layout.scaledClamp(26, 22, 30, true)}
              color={textColor}
            />
          </TouchableOpacity>
          <ThemedText
            style={[styles.headerTitle, { fontSize: layout.pageTitleSize }]}
            numberOfLines={1}
          >
            {metricLabel.toUpperCase()}
          </ThemedText>
          <View style={styles.headerRight} />
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: cardColor, padding: layout.cardPadding },
          ]}
        >
          <View style={styles.valueWrap}>
            <Ionicons
              name={metricData.icon}
              size={layout.scaledClamp(22, 18, 26, true)}
              color={metricData.statusColor}
            />
            <View style={styles.valueTextWrap}>
              <ThemedText
                style={[
                  styles.mainValue,
                  {
                    fontSize: layout.heroValueSize,
                    lineHeight: clamp(layout.heroValueSize + 4, 32, 44),
                  },
                ]}
              >
                {metricData.value}
              </ThemedText>
              <ThemedText
                type="muted"
                style={[styles.mainSubValue, { fontSize: layout.heroUnitSize }]}
              >
                {metricData.subValue}
              </ThemedText>
            </View>
          </View>
          <ThemedText
            style={[
              styles.statusText,
              { color: metricData.statusColor, fontSize: layout.statusSize },
            ]}
          >
            {metricData.status}
          </ThemedText>

          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: borderColor,
                height: layout.scaledClamp(12, 8, 14, true),
                borderRadius: layout.scaledClamp(6, 4, 8, true),
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(metricData.progress * 100, 100)}%`,
                  backgroundColor: metricData.statusColor,
                },
              ]}
            />
          </View>

          <View style={styles.rangeRow}>
            <ThemedText
              type="muted"
              style={[styles.rangeLabel, { fontSize: layout.bodySize }]}
            >
              {metricData.minLabel}
            </ThemedText>
            <ThemedText
              type="muted"
              style={[styles.rangeLabel, { fontSize: layout.bodySize }]}
            >
              {metricData.maxLabel}
            </ThemedText>
          </View>

          <View style={[styles.goalRow, { borderTopColor: borderColor }]}>
            <ThemedText
              style={[styles.goalText, { fontSize: layout.goalSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {metricData.goalLabel}
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={layout.scaledClamp(18, 14, 20, true)}
              color={mutedColor}
            />
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: cardColor, padding: layout.cardPadding },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { fontSize: layout.sectionTitleSize }]}
          >
            Last 7 days
          </ThemedText>
          <View style={[styles.weekChart, { height: layout.weekChartHeight }]}>
            {metricData.weekly.map((value, index) => (
              <View key={`${WEEK_DAYS[index]}-${value}`} style={styles.barWrap}>
                <View
                  style={[
                    styles.barTrack,
                    {
                      backgroundColor: borderColor,
                      height: layout.barTrackHeight,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.barValue,
                      {
                        height: `${(value / maxWeekly) * 100}%`,
                        backgroundColor:
                          index === metricData.weekly.length - 1
                            ? "#5D7DDF"
                            : "#3A4A77",
                      },
                    ]}
                  />
                </View>
                <ThemedText type="muted" style={styles.barLabel}>
                  {WEEK_DAYS[index]}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: cardColor, padding: layout.cardPadding },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { fontSize: layout.sectionTitleSize }]}
          >
            Compared with other users
          </ThemedText>
          <ThemedText
            type="muted"
            style={[
              styles.compareText,
              {
                fontSize: layout.bodySize,
                lineHeight: clamp(layout.bodySize + 7, 18, 24),
              },
            ]}
          >
            {metricData.compareText}
          </ThemedText>
          <View
            style={[styles.compareChart, { height: layout.compareChartHeight }]}
          >
            {metricData.compareBars.map((bar, index) => (
              <View
                key={`${index}-${bar}`}
                style={[
                  styles.compareBar,
                  {
                    height: 12 + bar * 10,
                    backgroundColor: index === 4 ? "#5D7DDF" : "#34456F",
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.compareRange}>
            <ThemedText type="muted" style={{ fontSize: layout.labelSize }}>
              Lesser
            </ThemedText>
            <ThemedText type="muted" style={{ fontSize: layout.labelSize }}>
              Greater
            </ThemedText>
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { backgroundColor: cardColor, padding: layout.cardPadding },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { fontSize: layout.sectionTitleSize }]}
          >
            {metricData.articleTitle}
          </ThemedText>
          <ThemedText
            type="muted"
            style={[
              styles.articleText,
              {
                fontSize: layout.bodySize,
                lineHeight: clamp(layout.bodySize + 8, 18, 24),
              },
            ]}
          >
            {metricData.articleBody}
          </ThemedText>
          <TouchableOpacity
            style={[styles.learnMore, { borderTopColor: borderColor }]}
          >
            <ThemedText
              style={[styles.learnMoreText, { fontSize: layout.bodySize }]}
            >
              Learn more
            </ThemedText>
            <Ionicons
              name="chevron-forward"
              size={layout.scaledClamp(18, 14, 20, true)}
              color={mutedColor}
            />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MetricDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 28,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 4,
  },
  valueTextWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
  },
  mainSubValue: {
    fontSize: 15,
    marginBottom: 4,
  },
  statusText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 7,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rangeLabel: {
    fontSize: 15,
  },
  goalRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  goalText: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  weekChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    gap: 8,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  barTrack: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barValue: {
    width: "100%",
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 12,
  },
  compareText: {
    fontSize: 15,
    marginBottom: 14,
    lineHeight: 22,
  },
  compareChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    gap: 5,
  },
  compareBar: {
    flex: 1,
    borderRadius: 4,
  },
  compareRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  articleText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  learnMore: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
