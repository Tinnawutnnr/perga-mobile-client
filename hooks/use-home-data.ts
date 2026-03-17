import { useAuth } from "@/context/auth-context";
import { mockDailyAverages } from "@/data/mockGaitData";
import { usePatientStore } from "@/store/patient-store";
import { DailyAverage, GaitData } from "@/types/metric";
import { useEffect, useMemo, useState } from "react";

export type Period = "daily" | "weekly" | "yearly";

const WINDOW_DAYS = 7; // days each side of the fall date

function avgRecords(records: DailyAverage[]): DailyAverage | null {
  if (records.length === 0) return null;
  const sum = records.reduce(
    (acc, r) => ({
      ...acc,
      total_steps: acc.total_steps + r.total_steps,
      total_calories: acc.total_calories + r.total_calories,
      total_distance_m: acc.total_distance_m + r.total_distance_m,
      avg_max_gyr_ms: acc.avg_max_gyr_ms + r.avg_max_gyr_ms,
      avg_val_gyr_hs: acc.avg_val_gyr_hs + r.avg_val_gyr_hs,
      avg_swing_time: acc.avg_swing_time + r.avg_swing_time,
      avg_stance_time: acc.avg_stance_time + r.avg_stance_time,
      avg_stride_cv: acc.avg_stride_cv + r.avg_stride_cv,
      anomaly_count: acc.anomaly_count + r.anomaly_count,
    }),
    {
      ...records[0],
      total_steps: 0,
      total_calories: 0,
      total_distance_m: 0,
      avg_max_gyr_ms: 0,
      avg_val_gyr_hs: 0,
      avg_swing_time: 0,
      avg_stance_time: 0,
      avg_stride_cv: 0,
      anomaly_count: 0,
    },
  );
  const n = records.length;
  return {
    ...sum,
    total_steps: Math.round(sum.total_steps / n),
    total_calories: sum.total_calories / n,
    total_distance_m: sum.total_distance_m / n,
    avg_max_gyr_ms: sum.avg_max_gyr_ms / n,
    avg_val_gyr_hs: sum.avg_val_gyr_hs / n,
    avg_swing_time: sum.avg_swing_time / n,
    avg_stance_time: sum.avg_stance_time / n,
    avg_stride_cv: sum.avg_stride_cv / n,
    anomaly_count: sum.anomaly_count,
  };
}

function toGaitData(r: DailyAverage): GaitData {
  return {
    distance: r.total_distance_m / 1000, // m → km
    cadence:
      r.avg_swing_time > 0
        ? Math.round(60 / (r.avg_swing_time + r.avg_stance_time))
        : 0,
    swingSpeed: Math.round(r.avg_max_gyr_ms),
    heelImpact: +r.avg_val_gyr_hs.toFixed(2),
    swingTime: +r.avg_swing_time.toFixed(2),
    stanceTime: +r.avg_stance_time.toFixed(2),
    stability: Math.max(0, Math.round((1 - r.avg_stride_cv) * 100)),
  };
}

export interface CompareMetric {
  label: string;
  unit: string;
  before: number;
  after: number;
  deltaPercent: number;
  higherIsBetter: boolean;
  evaluation?: "success" | "error" | "warning";
  disclaimer?: string;
}

export interface HomeData {
  periodGaitData: GaitData | null;
  latestGaitData: GaitData | null;
  latestRecord: DailyAverage | null;
  comparison: CompareMetric[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useHomeData = (
  fallDate?: string,
  period: Period = "daily",
): HomeData => {
  const { token } = useAuth();
  const { selectedPatient } = usePatientStore();

  const [records, setRecords] = useState<DailyAverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    // use mock data
    setRecords(mockDailyAverages);
    setLoading(false);
    setError(null);

    /* 
    // FOR REAL DATA
    if (!selectedPatient || !token) {
      setRecords(mockDailyAverages);
      return;
    }
    setLoading(true);
    setError(null);
    caretakerApi
      .getDailyAverages(selectedPatient.id, token)
      .then(setRecords)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    */
  }, [selectedPatient?.id, token, tick]);

  const latestRecord = useMemo(
    () => (records.length > 0 ? records[records.length - 1] : null),
    [records],
  );

  const latestGaitData = useMemo(
    () => (latestRecord ? toGaitData(latestRecord) : null),
    [latestRecord],
  );

  const periodGaitData = useMemo(() => {
    if (records.length === 0) return null;

    if (period === "daily") {
      return latestRecord ? toGaitData(latestRecord) : null;
    }

    const today = new Date();
    const cutoff = new Date(today);
    if (period === "weekly") cutoff.setDate(today.getDate() - 7);
    else cutoff.setFullYear(today.getFullYear() - 1);

    const cutoffStr = cutoff.toISOString().split("T")[0];
    const windowRecords = records.filter((r) => r.report_date >= cutoffStr);

    if (windowRecords.length === 0)
      return latestRecord ? toGaitData(latestRecord) : null;

    const avg = avgRecords(windowRecords);
    return avg ? toGaitData(avg) : null;
  }, [records, period, latestRecord]);

  const comparison = useMemo<CompareMetric[]>(() => {
    if (!fallDate || records.length === 0) return [];

    const beforeRecords = records
      .filter((r) => r.report_date < fallDate)
      .slice(-WINDOW_DAYS);

    const afterRecords = records
      .filter((r) => r.report_date >= fallDate)
      .slice(0, WINDOW_DAYS);

    const before = avgRecords(beforeRecords);
    const after = avgRecords(afterRecords);
    if (!before || !after) return [];

    const delta = (b: number, a: number): number => {
      if (b === 0 && a === 0) return 0;
      if (b === 0) return 100; // any increase from zero = 100% flagged
      return Math.round(((a - b) / Math.abs(b)) * 100);
    };

    // Helper to apply clinical MCID thresholds based on Perera et al. (2006)
    // < 5% = Normal variance (Success)
    // 5-10% = Small meaningful change (Warning/Caution)
    // > 10% = Substantial meaningful change (Error/Alert)
    const evaluateThreshold = (
      diffPercent: number,
    ): "success" | "warning" | "error" => {
      const absDiff = Math.abs(diffPercent);
      if (absDiff >= 10) return "error";
      if (absDiff >= 5) return "warning";
      return "success";
    };

    return [
      {
        label: "Swing Speed",
        unit: "°/s",
        before: Math.round(before.avg_max_gyr_ms),
        after: Math.round(after.avg_max_gyr_ms),
        deltaPercent: delta(before.avg_max_gyr_ms, after.avg_max_gyr_ms),
        higherIsBetter: true,
        evaluation:
          delta(before.avg_max_gyr_ms, after.avg_max_gyr_ms) <= -5
            ? evaluateThreshold(
                delta(before.avg_max_gyr_ms, after.avg_max_gyr_ms),
              )
            : "success",
        disclaimer:
          "Decrease indicates muscle weakness/onset of shuffling gait",
      },
      {
        label: "Heel Impact",
        unit: "",
        before: +before.avg_val_gyr_hs.toFixed(2),
        after: +after.avg_val_gyr_hs.toFixed(2),
        deltaPercent: delta(before.avg_val_gyr_hs, after.avg_val_gyr_hs),
        higherIsBetter: false,
        evaluation: evaluateThreshold(
          delta(before.avg_val_gyr_hs, after.avg_val_gyr_hs),
        ),
        disclaimer:
          delta(before.avg_val_gyr_hs, after.avg_val_gyr_hs) >= 5
            ? "Spike indicates foot slapping (tibialis anterior weakness)."
            : delta(before.avg_val_gyr_hs, after.avg_val_gyr_hs) <= -5
              ? "Drop indicates antalgic gait/limping."
              : "",
      },
      {
        label: "Swing Time",
        unit: "s",
        before: +before.avg_swing_time.toFixed(2),
        after: +after.avg_swing_time.toFixed(2),
        deltaPercent: delta(before.avg_swing_time, after.avg_swing_time),
        higherIsBetter: false,
        evaluation:
          delta(before.avg_swing_time, after.avg_swing_time) <= -5
            ? evaluateThreshold(
                delta(before.avg_swing_time, after.avg_swing_time),
              )
            : "success",
        disclaimer:
          delta(before.avg_swing_time, after.avg_swing_time) <= -5
            ? "Decrease correlates with shortened step/dragging."
            : "",
      },
      {
        label: "Stance Time",
        unit: "s",
        before: +before.avg_stance_time.toFixed(2),
        after: +after.avg_stance_time.toFixed(2),
        deltaPercent: delta(before.avg_stance_time, after.avg_stance_time),
        higherIsBetter: false,
        evaluation: evaluateThreshold(
          delta(before.avg_stance_time, after.avg_stance_time),
        ),
        disclaimer:
          delta(before.avg_stance_time, after.avg_stance_time) >= 5
            ? "Increase indicates cautious walking/fear of falling."
            : delta(before.avg_stance_time, after.avg_stance_time) <= -5
              ? "Sudden drop indicates joint pain avoidance."
              : "",
      },
      {
        label: "Stride CV",
        unit: "%",
        before: +(before.avg_stride_cv * 100).toFixed(1),
        after: +(after.avg_stride_cv * 100).toFixed(1),
        deltaPercent: delta(before.avg_stride_cv, after.avg_stride_cv),
        higherIsBetter: false,
        evaluation:
          delta(before.avg_stride_cv, after.avg_stride_cv) >= 5
            ? evaluateThreshold(
                delta(before.avg_stride_cv, after.avg_stride_cv),
              )
            : "success",
        disclaimer:
          delta(before.avg_stride_cv, after.avg_stride_cv) >= 5
            ? "High predictor of future falls."
            : "",
      },
      {
        label: "Anomalies",
        unit: "",
        before: before.anomaly_count,
        after: after.anomaly_count,
        deltaPercent:
          before.anomaly_count === 0
            ? after.anomaly_count > 0
              ? 100
              : 0
            : delta(before.anomaly_count, after.anomaly_count),
        higherIsBetter: false,
        evaluation:
          after.anomaly_count > before.anomaly_count ? "error" : "success",
      },
    ];
  }, [records, fallDate]);

  return {
    periodGaitData,
    latestGaitData,
    latestRecord,
    comparison,
    loading,
    error,
    refresh,
  };
};
