import React from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

const screenWidth = Dimensions.get("window").width;

interface DistanceChartProps {
  data: number[];
  maxValue?: number;
}

const DistanceChart: React.FC<DistanceChartProps> = ({ data, maxValue = 2.0 }) => {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, "accent");
  const mutedColor = useThemeColor({}, "muted"); 

  return (
    <ThemedView
      style={[styles.chartSection, { backgroundColor: cardColor, borderColor }]}
    >
      <ThemedView style={styles.chartHeaderRow}>
        <ThemedView style={styles.legendItem}>
          <ThemedView
            style={[styles.legendDot, { backgroundColor: accentColor }]}
          />
          <ThemedText style={[styles.axisLabel, { color: textColor }]}>
            Distance (km)
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartWrapper}>
        <ThemedView
          style={[
            styles.staticChartFrame,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {/* Y-Axis (Static) */}
          <ThemedView style={styles.staticYAxis}>
            <ThemedText style={[styles.yAxisLabel, { color: textColor }]}>
              {maxValue.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.yAxisLabel, { color: textColor }]}>
              {(maxValue * 0.75).toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.yAxisLabel, { color: textColor }]}>
              {(maxValue * 0.5).toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.yAxisLabel, { color: textColor }]}>
              {(maxValue * 0.25).toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.yAxisLabel, { color: textColor }]}>
              0.0
            </ThemedText>
          </ThemedView>

          {/* Chart Content Area */}
          <ThemedView
            style={[styles.chartContentArea, { backgroundColor: cardColor }]}
          >
            {/* Grid Lines (Static) */}
            <ThemedView style={styles.staticGridLines}>
              {[0, 1, 2, 3, 4].map((line) => (
                <ThemedView
                  key={line}
                  style={[styles.gridLine, { backgroundColor: borderColor }]}
                />
              ))}
            </ThemedView>

            {/* Scrollable Chart Data */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.chartScrollView}
              contentContainerStyle={styles.chartScrollContent}
            >
              <ThemedView style={styles.chartDataContainer}>
                {data.map((value, index) => {
                  const barHeight = Math.max((value / maxValue) * 140, 2);
                  return (
                    <ThemedView key={index} style={styles.dataColumn}>
                      <ThemedView style={styles.dataArea}>
                        <ThemedView
                          style={[
                            styles.distanceBar,
                            {
                              height: barHeight,
                              bottom: 0,
                              backgroundColor: accentColor,
                              shadowColor: accentColor,
                            },
                          ]}
                        />
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </ScrollView>

            {/* X-Axis (Static) */}
            <ThemedView style={styles.staticXAxis}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.xAxisScrollView}
                contentContainerStyle={styles.xAxisScrollContent}
              >
                <ThemedView style={styles.xAxisLabels}>
                  {data.map((_, index) => (
                    <ThemedView key={index} style={styles.xAxisLabelContainer}>
                      <ThemedText
                        style={[styles.xAxisLabel, { color: textColor }]}
                      >
                        {index + 1}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ScrollView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default DistanceChart;

const styles = StyleSheet.create({
  chartSection: {
    marginBottom: 24,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  axisLabel: {
    fontSize: screenWidth < 400 ? 13 : 15,
    fontWeight: "600",
  },
  chartWrapper: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 4,
  },
  staticChartFrame: {
    width: "100%",
    maxWidth: screenWidth - 40,
    height: screenWidth < 400 ? 220 : 250,
    borderRadius: screenWidth < 400 ? 12 : 16,
    borderWidth: 1,
    padding: screenWidth < 400 ? 12 : 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  staticYAxis: {
    position: "absolute",
    left: screenWidth < 400 ? 12 : 16,
    top: screenWidth < 400 ? 12 : 16,
    width: screenWidth < 400 ? 35 : 40,
    height: screenWidth < 400 ? 120 : 140,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  chartContentArea: {
    flex: 1,
    marginLeft: screenWidth < 400 ? 42 : 50,
    marginTop: 4,
  },
  staticGridLines: {
    position: "absolute",
    top: 4,
    left: 0,
    right: screenWidth < 400 ? 12 : 16,
    height: screenWidth < 400 ? 120 : 140,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    opacity: 0.8,
  },
  chartScrollView: {
    height: screenWidth < 400 ? 120 : 140,
    marginTop: 4,
  },
  chartScrollContent: {
    paddingHorizontal: 8,
  },
  chartDataContainer: {
    flexDirection: "row",
    height: screenWidth < 400 ? 120 : 140,
    alignItems: "flex-end",
  },
  dataColumn: {
    width: screenWidth < 400 ? 16 : 20,
    height: screenWidth < 400 ? 120 : 140,
    marginHorizontal: screenWidth < 400 ? 1 : 1.5,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dataArea: {
    width: screenWidth < 400 ? 12 : 16,
    height: screenWidth < 400 ? 120 : 140,
    position: "relative",
  },
  staticXAxis: {
    height: 30,
    marginLeft: -8,
    marginTop: 8,
  },
  xAxisScrollView: {
    height: 30,
  },
  xAxisScrollContent: {
    paddingHorizontal: 8,
  },
  xAxisLabels: {
    flexDirection: "row",
    height: 30,
    alignItems: "center",
  },
  xAxisLabelContainer: {
    width: screenWidth < 400 ? 19 : 23,
    alignItems: "center",
  },
  xAxisLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  yAxisLabel: {
    fontSize: screenWidth < 400 ? 10 : 12,
    textAlign: "right",
    fontWeight: "500",
  },
  distanceBar: {
    width: screenWidth < 400 ? 10 : 14,
    borderRadius: screenWidth < 400 ? 4 : 6,
    borderTopLeftRadius: screenWidth < 400 ? 4 : 6,
    borderTopRightRadius: screenWidth < 400 ? 4 : 6,
    position: "absolute",
    left: screenWidth < 400 ? 1 : 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});