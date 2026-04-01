import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { patientApi } from "@/api/patient";
import { caretakerApi } from "@/api/caretaker";
import { SingleMetricBenchmark, SingleMetricPeriod } from "@/types/compare";
import { CompareRange } from "@/types/metric";

import { useAuth } from "@/context/auth-context";

// Maps the navigation label param → API metric name
const LABEL_TO_METRIC_NAME: Record<string, string> = {
  "Swing Time": "avg_swing_time",
  "Swing Speed": "avg_max_gyr_ms",
  "Heel Impact": "avg_val_gyr_hs",
  "Stance Time": "avg_stance_time",
  Stability: "avg_stride_cv",
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

// ─── Hook result ──────────────────────────────────────────────────────────────

export interface UseMetricCompareResult {
  mode: CompareMode;
  setMode: (m: CompareMode) => void;
  range: CompareRange;
  setRange: (r: CompareRange) => void;

  isLoading: boolean;
  error: string | null;
  refetch: () => void;

  metricLabel: string | null;       // e.g. "Cadence"
  unit: string | null;              // e.g. "steps/min"
  higherIsBetter: boolean;

  selfBars: SelfBar[];
  maxSelf: number;

  otherBar: OtherBar | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMetricCompare = (): UseMetricCompareResult => {
  // label & optional patientUsername come from navigation params
  // e.g. router.push({ pathname: "/compare", params: { label: "Cadence", patientUsername: "john" } })
  const { label, patientUsername } = useLocalSearchParams<{
    label?: string;
    patientUsername?: string; // only present when role === "caretaker"
  }>();

  // ⚠️  Swap these to match your real auth hook/store
  const { token, role } = useAuth(); // role: "patient" | "caretaker"

  const metricName = LABEL_TO_METRIC_NAME[label ?? ""] ?? "cadence";

  const [mode, setMode] = useState<CompareMode>("self");
  const [range, setRange] = useState<CompareRange>("day");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SingleMetricBenchmark | null>(null);

  const load = useCallback(async () => {
    if(!token || !role) {
      setError("Authentication required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result: SingleMetricBenchmark;

      if (role === "caretaker" && patientUsername) {
        // Caretaker viewing a patient's benchmark
        result = await caretakerApi.getPatientBenchmark(
          patientUsername,
          metricName,
          token
        );
      } else {
        // Patient viewing their own benchmark
        result = await patientApi.getBenchmark(metricName, token);
      }

      setData(result);
    } catch {
      setError("Failed to load comparison data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [metricName, token, role, patientUsername]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Shape SingleMetricBenchmark → SelfBar[] based on selected range ───────
  //
  // The API returns one snapshot per period (daily/weekly/monthly/yearly).
  // We build a small history array from whichever fields are available so
  // the bar chart has something to render.  When the backend starts returning
  // richer history arrays you can replace this shaping logic without touching
  // any of the UI components.

  const periodForRange = (b: SingleMetricBenchmark, r: CompareRange): SingleMetricPeriod => {
    switch (r) {
      case "day":   return b.daily;
      case "week":  return b.weekly;
      case "month": return b.monthly;
      case "year":  return b.yearly;
    }
  };

  const selfBars: SelfBar[] = data
    ? buildSelfBars(data, range)
    : [];

  const maxSelf = Math.max(...selfBars.map((b) => b.value), 1);

  // ─── Shape SingleMetricBenchmark → OtherBar ────────────────────────────────

  const currentPeriod = data ? periodForRange(data, range) : null;

  const otherBar: OtherBar | null =
    currentPeriod &&
    currentPeriod.patient_value != null &&
    currentPeriod.cohort_avg != null
      ? {
          selfValue: currentPeriod.patient_value,
          peerValue: currentPeriod.cohort_avg,
          peerGroupLabel: data!.cohort_age_range,          // e.g. "60-65 years old"
          percentile: currentPeriod.percentile ?? undefined,
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
    metricLabel: label ?? null,
    unit: currentPeriod?.label ?? null,
    higherIsBetter: deriveHigherIsBetter(metricName),
    selfBars,
    maxSelf,
    otherBar,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a small ordered array of SelfBar from the four period snapshots.
 * The selected range's period is marked isLatest = true.
 *
 * Layout per range:
 *   day   → [yearly, monthly, weekly, daily]   (coarse → fine)
 *   week  → [yearly, monthly, weekly]
 *   month → [yearly, monthly]
 *   year  → [yearly]
 */
function buildSelfBars(
  b: SingleMetricBenchmark,
  range: CompareRange
): SelfBar[] {
  const periods: { period: SingleMetricPeriod; label: string; isLatest: boolean }[] = [
    { period: b.yearly,  label: "Year",  isLatest: range === "year" },
    { period: b.monthly, label: "Month", isLatest: range === "month" },
    { period: b.weekly,  label: "Week",  isLatest: range === "week" },
    { period: b.daily,   label: "Day",   isLatest: range === "day" },
  ];

  // Only show periods up to and including the selected range
  const rangeOrder: CompareRange[] = ["year", "month", "week", "day"];
  const cutoff = rangeOrder.indexOf(range);

  return periods
    .filter((_, i) => i <= cutoff + (4 - rangeOrder.length - cutoff))  // keep all coarser + current
    .filter((p) => p.period.patient_value != null)
    .map((p) => ({
      label: p.label,
      value: p.period.patient_value!,
      isLatest: p.isLatest,
    }));
}

/**
 * Metrics where a lower value is clinically better (e.g. heel impact, CV).
 * Everything else defaults to higher = better.
 */
function deriveHigherIsBetter(metricName: string): boolean {
  const lowerIsBetter = new Set(["avg_val_gyr_hs", "avg_stride_cv"]);
  return !lowerIsBetter.has(metricName);
}