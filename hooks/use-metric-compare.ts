import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  CompareRange,
  MetricCompareResponse,
  HistoryEntry,
  ComparisonData,
  MetricInfo,
} from "@/types/metric";
import { AllMetricsBenchmarkSchema, BenchmarkBar } from "@/types/compare";
import { patientApi } from "@/api/patient";
import { caretakerApi } from "@/api/caretaker";
import { useAuth } from "@/context/auth-context";
import { patientStorage } from "@/utils/token-storage";
import { mockCompareData } from "@/data/mockCompareData";

// ─── Metric name mapping ──────────────────────────────────────────────────────

const LABEL_TO_METRIC_NAME: Record<string, string> = {
  Cadence:        "avg_cadence",
  "Total Steps":  "total_steps",
  "Swing Speed":  "avg_max_gyr_ms",
  "Heel Impact":  "avg_val_gyr_hs",
  "Swing Time":   "avg_swing_time",
  "Stance Time":  "avg_stance_time",
  Stability:      "avg_stride_cv",
};

// ─── Unit map ─────────────────────────────────────────────────────────────────

const METRIC_UNIT: Record<string, string> = {
  avg_cadence:     "steps/min",
  total_steps:     "steps",
  avg_max_gyr_ms:  "deg/s",
  avg_val_gyr_hs:  "g",
  avg_swing_time:  "s",
  avg_stance_time: "s",
  avg_stride_cv:   "%",
};

// ─── Self-compare history fetch (mock until backend ready) ────────────────────

async function fetchMetricCompare(
  metricName: string,
  range: CompareRange
): Promise<MetricCompareResponse> {
  await new Promise((r) => setTimeout(r, 400));
  const metricData = mockCompareData[metricName] ?? mockCompareData["cadence"];
  return metricData[range];
}

// ─── Bar types ────────────────────────────────────────────────────────────────

export type CompareMode = "self" | "others";

export interface SelfBar {
  label: string;
  value: number;
  isLatest: boolean;
}

export interface OtherBar {
  selfValue: number;
  peerValue: number;
  peerGroupLabel: string;
  percentile?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseMetricCompareResult {
  mode: CompareMode;
  setMode: (m: CompareMode) => void;
  range: CompareRange;
  setRange: (r: CompareRange) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  metricInfo: MetricInfo | null;
  comparison: ComparisonData | null;
  selfBars: SelfBar[];
  maxSelf: number;
  otherBar: OtherBar | null;
  benchmarkBar: BenchmarkBar | null;
  benchmarkLoading: boolean;
  benchmarkError: string | null;
  refetchBenchmark: () => void;
  unit: string;
}

export const useMetricCompare = (): UseMetricCompareResult => {
  const { label } = useLocalSearchParams<{ label?: string }>();
  const { token, role } = useAuth();
  const metricName = LABEL_TO_METRIC_NAME[label ?? ""] ?? "avg_cadence";
  const unit = METRIC_UNIT[metricName] ?? "";

  const isCaretaker = role === "caretaker";

  const [mode, setMode] = useState<CompareMode>("self");
  const [range, setRange] = useState<CompareRange>("day");

  // ── Self compare state ──
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MetricCompareResponse | null>(null);

  // ── Benchmark state ──
  const [benchmarkData, setBenchmarkData] = useState<AllMetricsBenchmarkSchema | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  // ── Loaders ──────────────────────────────────────────────────────────────

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

  const loadBenchmark = useCallback(async () => {
    if (!token) return;

    setBenchmarkLoading(true);
    setBenchmarkError(null);
    try {
      let result: AllMetricsBenchmarkSchema;
      if (isCaretaker) {
        const patientUsername = await patientStorage.getUsername();
        if (!patientUsername) throw new Error("No patient selected");
        result = await caretakerApi.getPatientBenchmark(patientUsername, token);
      } else {
        result = await patientApi.getBenchmark(token);
      }
      setBenchmarkData(result);
    } catch {
      setBenchmarkError("Failed to load benchmark data. Please try again.");
    } finally {
      setBenchmarkLoading(false);
    }
  }, [token, isCaretaker]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadBenchmark(); }, [loadBenchmark]);

  // ── Shape: history[] → SelfBar[] ─────────────────────────────────────────

  const selfBars: SelfBar[] = (data?.history ?? []).map(
    (entry: HistoryEntry, i, arr) => ({
      label: formatDateLabel(entry.date, range),
      value: entry.value,
      isLatest: i === arr.length - 1,
    })
  );

  const maxSelf = Math.max(...selfBars.map((b) => b.value), 1);

  // ── Shape: comparison{} → OtherBar ───────────────────────────────────────

  const otherBar: OtherBar | null = data?.comparison
    ? {
        selfValue: data.comparison.patient_current_avg,
        peerValue: data.comparison.peer_group_avg,
        peerGroupLabel: data.comparison.peer_group_label,
        percentile: data.comparison.percentile,
      }
    : null;

  // ── Shape: benchmark API → BenchmarkBar ──────────────────────────────────

  const benchmarkBar: BenchmarkBar | null = (() => {
    if (!benchmarkData) return null;

    const metricEntry = benchmarkData.metrics?.[metricName];
    const source = metricEntry ?? benchmarkData;

    const patientValue = source.patient_value;
    const cohortAvg = source.cohort_avg;
    const lowerBound = source.lower_bound;
    const upperBound = source.upper_bound;

    if (
      patientValue == null ||
      cohortAvg == null ||
      lowerBound == null ||
      upperBound == null
    ) {
      return null;
    }

    return {
      patientValue,
      cohortAvg,
      lowerBound,
      upperBound,
      percentile: source.percentile ?? null,
      cohortAgeRange: benchmarkData.cohort_age_range,
      label: source.label ?? null, // typo "lable" matches API schema
    };
  })();

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
    benchmarkBar,
    benchmarkLoading,
    benchmarkError,
    refetchBenchmark: loadBenchmark,
    unit
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