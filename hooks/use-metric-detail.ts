import { useMetrics } from "@/hooks/use-metrics";
import { useLocalSearchParams } from "expo-router";
import { mockMetricDetailData, mockdata } from "../data/mockGaitData";
import { IconName, MetricDetailData } from "../types/metric";

export const useMetricDetail = () => {
  const { label } = useLocalSearchParams<{ label?: string }>();

  const allMetrics = useMetrics(mockdata);
  const metricLabel = (
    label && label in mockMetricDetailData ? label : "Cadence"
  ) as keyof typeof mockMetricDetailData;

  const baseMetric = allMetrics.find((m) => m.label === metricLabel);

  const detailData = mockMetricDetailData[metricLabel] as MetricDetailData;

  const mergedData: MetricDetailData = {
    ...detailData,
    iconName: (baseMetric?.iconName || detailData.iconName) as IconName,
  };

  const maxWeekly = Math.max(...mergedData.weekly);

  return {
    label: metricLabel,
    data: mergedData,
    maxWeekly,
  };
};
