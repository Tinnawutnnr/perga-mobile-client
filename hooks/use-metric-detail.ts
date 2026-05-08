import { caregiverApi } from "@/api/caregiver";
import { patientApi } from "@/api/patient";
import { useAuth } from "@/context/auth-context";
import { useMetricCompare } from "@/hooks/use-metric-compare";
import { useMetrics } from "@/hooks/use-metrics";
import { DailyAverage } from "@/types/report";
import { patientStorage } from "@/utils/token-storage";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { mockMetricDetailData } from "../data/mockGaitData";
import { GaitData, IconName, MetricDetailData } from "../types/metric";

/** Get today's date in YYYY-MM-DD using local timezone (not UTC) */
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Maps the route param label (which matches mockMetricDetailData keys)
 * to the label used inside useMetrics — so we can find the correct baseMetric.
 */
const MOCK_KEY_TO_METRICS_LABEL: Record<string, string> = {
  Cadence: "Cadence",
  "Total Steps": "Total Steps",
  "Swing Speed": "Leg Swing Speed",
  "Heel Impact": "Foot Landing Force",
  "Swing Time": "In-Air Time",
  "Stance Time": "On-Ground Time",
  Stability: "Step Inconsistency",
};

/**
 * Returns true only if the API returned a record with at least one field
 * that has a real non-zero value.
 */
function hasMeaningfulData(data: DailyAverage | null | undefined): boolean {
  if (data == null) return false;
  return (
    (data.total_steps != null && data.total_steps > 0) ||
    (data.avg_cadence != null && data.avg_cadence > 0) ||
    (data.avg_max_gyr_ms != null && data.avg_max_gyr_ms > 0) ||
    (data.avg_val_gyr_hs != null && data.avg_val_gyr_hs !== 0) ||
    (data.avg_swing_time != null && data.avg_swing_time > 0) ||
    (data.avg_stance_time != null && data.avg_stance_time > 0) ||
    (data.avg_stride_cv != null && data.avg_stride_cv > 0)
  );
}

/** Parse label strings like "40k", "1.5k", "70%", "-4.0" into numbers */
function parseRangeLabel(label: string): number {
  const s = label.replace(/,/g, "").replace(/%/g, "").trim();
  if (s.endsWith("k") || s.endsWith("K")) {
    return parseFloat(s.slice(0, -1)) * 1000;
  }
  return parseFloat(s);
}

function computeProgressFromNumber(
  value: number,
  minLabel: string,
  maxLabel: string,
): number {
  const minVal = parseRangeLabel(minLabel);
  const maxVal = parseRangeLabel(maxLabel);
  if (isNaN(value) || isNaN(minVal) || isNaN(maxVal) || maxVal === minVal) {
    return 0;
  }
  return Math.min(Math.max((value - minVal) / (maxVal - minVal), 0), 1);
}

export const useMetricDetail = () => {
  const { label } = useLocalSearchParams<{ label?: string }>();
  const { token, role } = useAuth();
  const { unit } = useMetricCompare();

  const [apiData, setApiData] = useState<DailyAverage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDailyByDate = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const today = getLocalDateString();

      let response: DailyAverage | null = null;
      if (role === "caregiver") {
        const patientUsername = await patientStorage.getUsername();
        if (patientUsername) {
          response = await caregiverApi.getDailyAverageByDate(
            patientUsername,
            today,
            token,
          );
        }
      } else {
        response = await patientApi.getDailyAverageByDate(today, token);
      }

      // If API returned data for a different date, treat today as no data
      if (response && response.report_date !== today) {
        setApiData(null);
      } else {
        setApiData(response);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setApiData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    fetchDailyByDate();
  }, [fetchDailyByDate]);

  const currentGaitData: GaitData = {
    totalSteps: apiData?.total_steps ?? 0,
    cadence: apiData?.avg_cadence ?? 0,
    swingSpeed: apiData?.avg_max_gyr_ms ?? 0,
    heelImpact: apiData?.avg_val_gyr_hs ?? 0,
    swingTime: apiData?.avg_swing_time ?? 0,
    stanceTime: apiData?.avg_stance_time ?? 0,
    stability: apiData?.avg_stride_cv ?? 0,
    distance: apiData?.total_distance_m ?? 0,
  };

  const allMetrics = useMetrics(currentGaitData);

  // rawLabel matches mockMetricDetailData keys (e.g. "Swing Speed")
  const rawLabel = label || "Cadence";

  // Map rawLabel → the label used inside useMetrics (e.g. "Leg Swing Speed")
  const displayLabel = MOCK_KEY_TO_METRICS_LABEL[rawLabel] ?? rawLabel;
  const metricsLabel = displayLabel;

  const baseMetric = allMetrics.find(
    (m) => m.label.toLowerCase() === metricsLabel.toLowerCase(),
  );

  // Find config from mock, fallback to first entry if not found
  const configKey = Object.keys(mockMetricDetailData).find(
    (k) => k.toLowerCase() === rawLabel.toLowerCase(),
  ) as keyof typeof mockMetricDetailData;

  const detailConfig =
    mockMetricDetailData[configKey] || Object.values(mockMetricDetailData)[0];

  const hasData = hasMeaningfulData(apiData);

  const rawMetricValueByLabel: Record<string, number> = {
    Cadence: currentGaitData.cadence,
    "Total Steps": currentGaitData.totalSteps,
    "Swing Speed": currentGaitData.swingSpeed,
    "Heel Impact": currentGaitData.heelImpact,
    "Swing Time": currentGaitData.swingTime,
    "Stance Time": currentGaitData.stanceTime,
    Stability: currentGaitData.stability,
  };

  const rawMetricValue = rawMetricValueByLabel[rawLabel] ?? 0;

  const mergedData: MetricDetailData = {
    ...detailConfig,
    value: hasData ? (baseMetric?.value ?? "0") : "--",
    subValue: hasData
      ? (baseMetric?.subValue ?? unit ?? detailConfig.subValue)
      : "",
    iconName: (baseMetric?.iconName || detailConfig.iconName) as IconName,
    status: hasData
      ? baseMetric?.status || detailConfig.status
      : "No data recorded today",
    statusColor: hasData
      ? baseMetric?.statusColor || detailConfig.statusColor
      : "#9E9E9E",
    progress:
      hasData && baseMetric
        ? computeProgressFromNumber(
            rawMetricValue,
            detailConfig.minLabel,
            detailConfig.maxLabel,
          )
        : 0,
  };

  return {
    label: displayLabel,
    data: mergedData,
    isLoading,
    refetch: fetchDailyByDate,
  };
};
