import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  CompareRange,
  MetricCompareResponse,
  HistoryEntry,
  ComparisonData,
  MetricInfo,
} from "@/types/metric";
import { mockCompareData } from "@/data/mockCompareData";

// ─── API call ─────────────────────────────────────────────────────────────────
// Swap the body of fetchMetricCompare() for your real fetch() when backend is ready.

// Maps the navigation label param to the API metric name
const LABEL_TO_METRIC_NAME: Record<string, string> = {
  Cadence: "cadence",
  "Total Steps": "total_steps",
  Calories: "total_calories",
  "Swing Speed": "avg_max_gyr_ms",
  "Heel Impact": "avg_val_gyr_hs",
  "Step Duration": "avg_step_duration",
  Stability: "avg_stride_cv",
};

// ─── API call ─────────────────────────────────────────────────────────────────
// Swap the body of this function for your real fetch() when the backend is ready.

async function fetchMetricCompare(
  metricName: string,
  range: CompareRange
): Promise<MetricCompareResponse> {
  await new Promise((r) => setTimeout(r, 400)); // simulate network latency

  // Real implementation (uncomment when backend is ready):
  // const res = await fetch(
  //   `/api/metrics/compare?metric=${metricName}&range=${range}`
  // );
  // if (!res.ok) throw new Error("Network response was not ok");
  // return res.json();

  const metricData = mockCompareData[metricName] ?? mockCompareData["cadence"];
  return metricData[range];
}

// ─── Bar types ────────────────────────────────────────────────────────────────

export type CompareMode = "self" | "others";

export interface SelfBar {
  label: string;     // x-axis label derived from the history date
  value: number;
  isLatest: boolean;
}

export interface OtherBar {
  selfValue: number;
  peerValue: number;
  peerGroupLabel: string;    // e.g. "60-65 years old"
  percentile?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseMetricCompareResult {
  // ui state
  mode: CompareMode;
  setMode: (m: CompareMode) => void;
  range: CompareRange;
  setRange: (r: CompareRange) => void;

  // async state
  isLoading: boolean;
  error: string | null;
  refetch: () => void;

  // metadata from API
  metricInfo: MetricInfo | null;
  comparison: ComparisonData | null;

  // self compare — shaped from history[]
  selfBars: SelfBar[];
  maxSelf: number;

  // other compare — shaped from comparison{}
  otherBar: OtherBar | null;
}

export const useMetricCompare = (): UseMetricCompareResult => {
  const { label } = useLocalSearchParams<{ label?: string }>();
  const metricName = LABEL_TO_METRIC_NAME[label ?? ""] ?? "cadence";

  const [mode, setMode] = useState<CompareMode>("self");
  const [range, setRange] = useState<CompareRange>("day");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MetricCompareResponse | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMetricCompare(metricName, range);
      setData(result);
    } catch {
      setError("Failed to load comparison data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [metricName, range]);

  useEffect(() => {
    load();
  }, [load]);

  // Shape history[] → SelfBar[]
  const selfBars: SelfBar[] = (data?.history ?? []).map(
    (entry: HistoryEntry, i, arr) => ({
      label: formatDateLabel(entry.date, range),
      value: entry.value,
      isLatest: i === arr.length - 1,
    })
  );

  const maxSelf = Math.max(...selfBars.map((b) => b.value), 1);

  // Shape comparison{} → OtherBar
  const otherBar: OtherBar | null = data?.comparison
    ? {
        selfValue: data.comparison.patient_current_avg,
        peerValue: data.comparison.peer_group_avg,
        peerGroupLabel: data.comparison.peer_group_label,
        percentile: data.comparison.percentile,
      }
    : null;

  return {
    mode,
    setMode,
    range,
    setRange,
    isLoading,
    error,
    refetch: load,
    metricInfo: data?.metric_info ?? null,
    comparison: data?.comparison ?? null,
    selfBars,
    maxSelf,
    otherBar,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLabel(dateStr: string, range: CompareRange): string {
  const d = new Date(dateStr);
  switch (range) {
    case "day":
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    case "week":
      return `W${getISOWeek(d)}`;
    case "month":
      return d.toLocaleString("en", { month: "short" });
    case "year":
      return `Q${Math.ceil((d.getMonth() + 1) / 3)}`;
  }
}

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}