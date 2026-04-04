import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  CompareRange,
  ComparisonData,
  MetricInfo,
} from "@/types/metric";
import { AllMetricsBenchmarkSchema, BenchmarkBar } from "@/types/compare";
import { DailyAverage, WeeklyAverage, MonthlyAverage, YearlyAverage } from "@/types/report";
import { patientApi } from "@/api/patient";
import { caretakerApi } from "@/api/caretaker";
import { useAuth } from "@/context/auth-context";
import { patientStorage } from "@/utils/token-storage";

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

// ─── Date label helpers ───────────────────────────────────────────────────────

/** "2024-04-01" → "Mon" */
function formatDailyLabel(reportDate: string): string {
  const d = new Date(reportDate);
  return isNaN(d.getTime())
    ? reportDate
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

/** "2024-14" (YYYY-WW) → "W14" */
function formatWeekLabel(reportWeek: string): string {
  const parts = reportWeek.split("-");
  return parts.length >= 2 ? `W${parts[1]}` : reportWeek;
}

/** "2024-04" (YYYY-MM) → "Apr" */
function formatMonthLabel(reportMonth: string): string {
  const d = new Date(`${reportMonth}-01`);
  return isNaN(d.getTime())
    ? reportMonth
    : d.toLocaleString("en", { month: "short" });
}

/** Pull a metric value safely from any average row */
function pickMetric(row: unknown, metricName: string): number {
  return Number((row as Record<string, unknown>)[metricName] ?? 0);
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
  const [selfBars, setSelfBars] = useState<SelfBar[]>([]);

  // ── Benchmark state ──
  const [benchmarkData, setBenchmarkData] = useState<AllMetricsBenchmarkSchema | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const patientUsername = isCaretaker
        ? await patientStorage.getUsername()
        : null;

      if (isCaretaker && !patientUsername) {
        throw new Error("No patient selected");
      }

      let bars: SelfBar[];

      // ── Fetch + map per time-range ────────────────────────────────────────
      if (range === "day") {
        const rows: DailyAverage[] = isCaretaker
          ? await caretakerApi.getPatientDailyAverages(patientUsername!, token)
          : await patientApi.getDailyAverages(token);
        bars = rows.map((row, i, arr) => ({
          label: formatDailyLabel(row.report_date),
          value: pickMetric(row, metricName),
          isLatest: i === arr.length - 1,
        }));
      } else if (range === "week") {
        const rows: WeeklyAverage[] = isCaretaker
          ? await caretakerApi.getPatientWeeklyAverage(patientUsername!, token)
          : await patientApi.getWeeklyAverage(token);
        bars = rows.map((row, i, arr) => ({
          label: formatWeekLabel(row.report_week),
          value: pickMetric(row, metricName),
          isLatest: i === arr.length - 1,
        }));
      } else if (range === "month") {
        const rows: MonthlyAverage[] = isCaretaker
          ? await caretakerApi.getPatientMonthlyAverage(patientUsername!, token)
          : await patientApi.getMonthlyAverage(token);
        bars = rows.map((row, i, arr) => ({
          label: formatMonthLabel(row.report_month),
          value: pickMetric(row, metricName),
          isLatest: i === arr.length - 1,
        }));
      } else {
        // "year"
        const rows: YearlyAverage[] = isCaretaker
          ? await caretakerApi.getPatientYearlyAverage(patientUsername!, token)
          : await patientApi.getYearlyAverage(token);
        bars = rows.map((row, i, arr) => ({
          label: String(row.report_year),
          value: pickMetric(row, metricName),
          isLatest: i === arr.length - 1,
        }));
      }

      setSelfBars(bars);
    } catch (e) {
      setError("Failed to load comparison data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, isCaretaker, range, metricName]);

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

  // ── Derived values ────────────────────────────────────────────────────────

  const maxSelf = Math.max(...selfBars.map((b) => b.value), 1);

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
      label: source.label ?? null,
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
    metricInfo: null,       // not returned by average endpoints; extend if needed
    comparison: null,       // not returned by average endpoints; extend if needed
    selfBars,
    maxSelf,
    otherBar: null,         // not returned by average endpoints; extend if needed
    benchmarkBar,
    benchmarkLoading,
    benchmarkError,
    refetchBenchmark: loadBenchmark,
    unit,
  };
};