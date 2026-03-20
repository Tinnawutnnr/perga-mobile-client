import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { mockDailyAverages } from "@/data/mockGaitData";
import { DailyAverage } from "@/types/metric";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

type Period = "daily" | "weekly" | "monthly" | "yearly";

interface AnomalyChartProps {
  records?: DailyAverage[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "daily", label: "Day" },
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
  { key: "yearly", label: "Year" },
];

const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 28;
const CHART_PADDING_RIGHT = 12;
const CHART_PADDING_TOP = 12;
const CHART_PADDING_BOTTOM = 28;

function groupByPeriod(
  records: DailyAverage[],
  period: Period
): { label: string; count: number }[] {
  if (period === "daily") {
    // Last 14 days
    const last14 = records.slice(-14);
    return last14.map((r) => {
      const d = new Date(r.report_date);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      return { label, count: r.anomaly_count };
    });
  }

  if (period === "weekly") {
    // Group by ISO week, last 8 weeks
    const weekMap: Record<string, { label: string; count: number; week: string }> = {};
    records.forEach((r) => {
      const d = new Date(r.report_date);
      // Get monday of week
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      const key = monday.toISOString().split("T")[0];
      if (!weekMap[key]) {
        const label = `${monday.getDate()}/${monday.getMonth() + 1}`;
        weekMap[key] = { label, count: 0, week: key };
      }
      weekMap[key].count += r.anomaly_count;
    });
    const sorted = Object.values(weekMap)
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
    return sorted.map(({ label, count }) => ({ label, count }));
  }

  if (period === "monthly") {
    // Group by year-month, last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap: Record<string, { label: string; count: number; key: string }> = {};
    records.forEach((r) => {
      const d = new Date(r.report_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { label: monthNames[d.getMonth()], count: 0, key };
      }
      monthMap[key].count += r.anomaly_count;
    });
    const sorted = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
    return sorted.map(({ label, count }) => ({ label, count }));
  }

  // yearly
  const yearMap: Record<string, number> = {};
  records.forEach((r) => {
    const year = r.report_date.substring(0, 4);
    yearMap[year] = (yearMap[year] ?? 0) + r.anomaly_count;
  });
  return Object.entries(yearMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ label: year, count }));
}

export function AnomalyChart({ records = mockDailyAverages }: AnomalyChartProps) {
  const [period, setPeriod] = useState<Period>("daily");
  const cardColor = useThemeColor({}, "card");
  const tintColor = useThemeColor({}, "tint");
  const scheme = useColorScheme() ?? "light";

  const textColor = scheme === "dark" ? "#CCCCCC" : "#666666";
  const gridColor = scheme === "dark" ? "#2A2A2A" : "#EEEEEE";
  const errorColor = scheme === "dark" ? "#EF5350" : "#FF4444";

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 40 - 32; // screen padding - card padding

  const data = useMemo(() => groupByPeriod(records, period), [records, period]);

  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  );

  // Round up to nice number
  const yMax = useMemo(() => {
    if (maxCount <= 5) return 5;
    if (maxCount <= 10) return 10;
    return Math.ceil(maxCount / 5) * 5;
  }, [maxCount]);

  const plotW = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const plotH = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const step = data.length > 1 ? plotW / (data.length - 1) : plotW / 2;
    return data.map((d, i) => ({
      x: CHART_PADDING_LEFT + (data.length > 1 ? i * step : plotW / 2),
      y: CHART_PADDING_TOP + plotH - (d.count / yMax) * plotH,
      count: d.count,
      label: d.label,
    }));
  }, [data, plotW, plotH, yMax]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    // Smooth bezier curve
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      const cp1y = points[i - 1].y;
      const cp2x = cp1x;
      const cp2y = points[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, [points]);

  const fillD = useMemo(() => {
    if (points.length === 0) return "";
    const bottom = CHART_PADDING_TOP + plotH;
    return (
      pathD +
      ` L ${points[points.length - 1].x} ${bottom}` +
      ` L ${points[0].x} ${bottom}` +
      " Z"
    );
  }, [pathD, points, plotH]);

  const yTicks = [0, Math.round(yMax / 2), yMax];

  // Total anomalies in current view
  const totalAnomalies = data.reduce((s, d) => s + d.count, 0);

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <ThemedText style={styles.title}>Anomaly Events</ThemedText>
          <ThemedText type="muted" style={styles.subtitle}>
            {totalAnomalies} detected · {data.length} {period === "daily" ? "days" : period === "weekly" ? "weeks" : period === "monthly" ? "months" : "years"}
          </ThemedText>
        </View>
        {/* Pill tabs */}
        <View style={[styles.tabs, { backgroundColor: scheme === "dark" ? "#111" : "#EDEDED" }]}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[
                styles.tab,
                period === p.key && { backgroundColor: tintColor },
              ]}
              activeOpacity={0.8}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: period === p.key ? "#FFF" : textColor },
                ]}
              >
                {p.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="anomalyFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={errorColor} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={errorColor} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y =
            CHART_PADDING_TOP + plotH - (tick / yMax) * plotH;
          return (
            <React.Fragment key={tick}>
              <Line
                x1={CHART_PADDING_LEFT}
                y1={y}
                x2={CHART_PADDING_LEFT + plotW}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
              />
              <SvgText
                x={CHART_PADDING_LEFT - 4}
                y={y + 4}
                fontSize={9}
                fill={textColor}
                textAnchor="end"
              >
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Fill area */}
        {fillD !== "" && (
          <Path d={fillD} fill="url(#anomalyFill)" />
        )}

        {/* Line */}
        {pathD !== "" && (
          <Path
            d={pathD}
            fill="none"
            stroke={errorColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points & x-labels */}
        {points.map((pt, i) => {
          // Show every nth label depending on count
          const step =
            data.length <= 7 ? 1 :
            data.length <= 12 ? 2 :
            Math.ceil(data.length / 6);
          const showLabel = i % step === 0 || i === data.length - 1;

          return (
            <React.Fragment key={i}>
              {/* Dot */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={pt.count > 0 ? 4 : 2.5}
                fill={pt.count > 0 ? errorColor : gridColor}
                stroke={cardColor}
                strokeWidth={1.5}
              />
              {/* Count label above dot (only if > 0) */}
              {pt.count > 0 && (
                <SvgText
                  x={pt.x}
                  y={pt.y - 7}
                  fontSize={9}
                  fill={errorColor}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {pt.count}
                </SvgText>
              )}
              {/* X-axis label */}
              {showLabel && (
                <SvgText
                  x={pt.x}
                  y={CHART_PADDING_TOP + plotH + 18}
                  fontSize={9}
                  fill={textColor}
                  textAnchor="middle"
                >
                  {pt.label}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: errorColor }]} />
        <ThemedText type="muted" style={styles.legendText}>
          Anomaly count per {period === "daily" ? "day" : period === "weekly" ? "week" : period === "monthly" ? "month" : "year"}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tab: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
});