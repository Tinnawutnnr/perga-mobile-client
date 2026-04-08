import { useMetrics } from "@/hooks/use-metrics";
import { useLocalSearchParams } from "expo-router";
import { mockMetricDetailData } from "../data/mockGaitData"; // ลบ mockdata ออก
import { IconName, MetricDetailData } from "../types/metric";
import { useMetricCompare } from "@/hooks/use-metric-compare"; // นำเข้า hook ตัวนี้

export const useMetricDetail = () => {
  const { label } = useLocalSearchParams<{ label?: string }>();
  const { selfBars, unit, isLoading } = useMetricCompare();
  const latestDataPoint = selfBars.find(bar => bar.isLatest);
  const displayValue = latestDataPoint ? latestDataPoint.value : 0;
  const currentGaitData = {
    totalSteps: label === "Total Steps" ? displayValue : 0,
    cadence: label === "Cadence" ? displayValue : 0,
    swingSpeed: label === "Swing Speed" ? displayValue : 0,
    heelImpact: label === "Heel Impact" ? displayValue : 0,
    swingTime: label === "Swing Time" ? displayValue : 0,
    stanceTime: label === "Stance Time" ? displayValue : 0,
    stability: label === "Stability" ? displayValue : 0,
    distance: 0, 
  };

  const allMetrics = useMetrics(currentGaitData);
  const metricLabel = (
    label && label in mockMetricDetailData ? label : "Cadence"
  ) as keyof typeof mockMetricDetailData;
  const baseMetric = allMetrics.find((m) => m.label === metricLabel);
  const detailData = mockMetricDetailData[metricLabel] as MetricDetailData;
  const mergedData: MetricDetailData = {
    ...detailData,
    value: latestDataPoint ? latestDataPoint.value.toLocaleString() : detailData.value,
    subValue: unit || detailData.subValue,
    iconName: (baseMetric?.iconName || detailData.iconName) as IconName,
    status: baseMetric?.status || detailData.status,
  };

  const maxWeekly = Math.max(...mergedData.weekly);

  return {
    label: metricLabel,
    data: mergedData,
    maxWeekly,
    isLoading,
  };
};