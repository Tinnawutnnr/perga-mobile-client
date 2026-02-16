import { useLocalSearchParams } from "expo-router";
import { useMetricLayout } from "./use-metric-layout";
import { mockMetricDetailData, mockdata } from "../data/mockGaitData";
import { MetricDetailData, IconName } from "../types/metric"; 
import { useMetrics } from "@/hooks/use-metrics";

export const useMetricDetail = () => {
  const layout = useMetricLayout();
  const { label } = useLocalSearchParams<{ label?: string }>();

  const allMetrics = useMetrics(mockdata);
  const metricLabel = (
    label && label in mockMetricDetailData 
      ? label 
      : "Cadence"
  ) as keyof typeof mockMetricDetailData;

  const baseMetric = allMetrics.find(m => m.label === metricLabel);
  
  const detailData = mockMetricDetailData[metricLabel] as MetricDetailData;

  const mergedData: MetricDetailData = {
    ...detailData,
    iconName: (baseMetric?.iconName || detailData.iconName) as IconName,
  };

  const maxWeekly = Math.max(...mergedData.weekly);

  return {
    layout,
    label: metricLabel,
    data: mergedData,
    maxWeekly,
  };
};