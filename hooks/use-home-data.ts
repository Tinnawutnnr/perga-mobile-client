import {
  ComparisonReport,
  FallAnalysisResponse,
} from "@/types/report";
import { caretakerApi } from "@/api/caretaker";
import { patientApi } from "@/api/patient";
import { useAuth } from "@/context/auth-context";
import { usePatientStore } from "@/store/patient-store";
import { DailyAverage, GaitData } from "@/types/metric";
import { useEffect, useMemo, useState } from "react";

export type Period = "daily" | "weekly" | "yearly";
export type CompareDuration = "week" | "month" | "year";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { ComparisonReport, FallAnalysisResponse };

export interface HomeData {
  periodGaitData: GaitData | null;
  selectedDateGaitData: GaitData | null;
  availableDates: string[];
  latestGaitData: GaitData | null;
  latestRecord: DailyAverage | null;
  fallAnalysis: FallAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats Date object to YYYY-MM-DD string
 */
function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates average values from an array of DailyAverage records
 */
function avgRecords(records: DailyAverage[]): DailyAverage | null {
  if (records.length === 0) return null;
  const sum = records.reduce(
    (acc, r) => ({
      ...acc,
      total_steps:      (acc.total_steps      ?? 0) + (r.total_steps      ?? 0),
      total_calories:   (acc.total_calories   ?? 0) + (r.total_calories   ?? 0),
      total_distance_m: (acc.total_distance_m ?? 0) + (r.total_distance_m ?? 0),
      avg_max_gyr_ms:   (acc.avg_max_gyr_ms   ?? 0) + (r.avg_max_gyr_ms   ?? 0),
      avg_val_gyr_hs:   (acc.avg_val_gyr_hs   ?? 0) + (r.avg_val_gyr_hs   ?? 0),
      avg_swing_time:   (acc.avg_swing_time   ?? 0) + (r.avg_swing_time   ?? 0),
      avg_stance_time:  (acc.avg_stance_time  ?? 0) + (r.avg_stance_time  ?? 0),
      avg_stride_cv:    (acc.avg_stride_cv    ?? 0) + (r.avg_stride_cv    ?? 0),
      anomaly_count:    (acc.anomaly_count    ?? 0) + (r.anomaly_count    ?? 0),
    }),
    { ...records[0] },
  );
  const n = records.length;
  return {
    ...sum,
    total_steps:      Math.round((sum.total_steps      ?? 0) / n),
    total_calories:   (sum.total_calories   ?? 0) / n,
    total_distance_m: (sum.total_distance_m ?? 0) / n,
    avg_max_gyr_ms:   (sum.avg_max_gyr_ms   ?? 0) / n,
    avg_val_gyr_hs:   (sum.avg_val_gyr_hs   ?? 0) / n,
    avg_swing_time:   (sum.avg_swing_time   ?? 0) / n,
    avg_stance_time:  (sum.avg_stance_time  ?? 0) / n,
    avg_stride_cv:    (sum.avg_stride_cv    ?? 0) / n,
    anomaly_count:    sum.anomaly_count ?? 0,
  };
}

/**
 * Transforms DailyAverage DB model to GaitData UI model
 */
function toGaitData(r: DailyAverage): GaitData {
  const swingTime  = r.avg_swing_time  ?? 0;
  const stanceTime = r.avg_stance_time ?? 0;
  
  return {
    distance:    (r.total_distance_m ?? 0) / 1000,
    cadence:     swingTime > 0 ? Math.round(60 / (swingTime + stanceTime)) : 0,
    swingSpeed:  Math.round(r.avg_max_gyr_ms ?? 0),
    heelImpact:  +(r.avg_val_gyr_hs ?? 0).toFixed(2),
    swingTime:   +swingTime.toFixed(2),
    stanceTime:  +stanceTime.toFixed(2),
    stability:   Math.max(0, Math.round((1 - (r.avg_stride_cv ?? 0)) * 100)),
    totalSteps:  r.total_steps ?? 0,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useHomeData = (
  fallDate?: string,
  period: Period = "daily",
  selectedDate?: string,
): HomeData => {
  const { token, role } = useAuth();
  const { selectedPatient } = usePatientStore();

  const [records, setRecords] = useState<DailyAverage[]>([]);
  const [selectedDateRecord, setSelectedDateRecord] = useState<DailyAverage | null>(null);
  const [fallAnalysis, setFallAnalysis] = useState<FallAnalysisResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  // ── Fetch Daily Records ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !role) {
      setRecords([]);
      return;
    }

    if (role === "caretaker") {
      if (!selectedPatient?.username) {
        setRecords([]);
        setSelectedDateRecord(null);
        return;
      }

      // Default to today's date if no date is selected
      const todayStr = toLocalISODate(new Date());
      const dateToFetch = selectedDate || todayStr;

      setLoading(true);
      setError(null);
      caretakerApi
        .getDailyAverageByDate(selectedPatient.username, dateToFetch, token)
        .then((response: any) => {
          setSelectedDateRecord(response.data || response);
        })
        .catch((e: Error) => {
          // 404 means no data for that day; clear state without throwing error
          if (!e.message.includes("404")) setError(e.message);
          setSelectedDateRecord(null);
        })
        .finally(() => setLoading(false));

    } else {
      // Fetch all records for Patient role
      setLoading(true);
      setError(null);
      patientApi
        .getDailyAverages(token)
        .then((res: any) => setRecords(res.data || res))
        .catch((e: Error) => {
          setError(e.message);
          setRecords([]);
        })
        .finally(() => setLoading(false));
    }
  }, [token, role, selectedPatient?.username, selectedDate, tick]);

  // ── Fetch Fall Analysis ───────────────────────────────────────────────────
  useEffect(() => {
    if (!fallDate || !token || !role) {
      setFallAnalysis(null);
      return;
    }

    if (role === "caretaker") {
      if (!selectedPatient?.username) return;

      setLoading(true);
      setError(null);
      caretakerApi
        .getFallAnalysis(selectedPatient.username, fallDate, token)
        .then((res: any) => setFallAnalysis(res.data))
        .catch((e: Error) => {
          if (!e.message.includes("404")) setError(e.message);
          setFallAnalysis(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Patient fetches their own fall analysis
      setLoading(true);
      setError(null);
      patientApi
        .getFallAnalysis(fallDate, token)
        .then((res: any) => setFallAnalysis(res.data))
        .catch((e: Error) => {
          if (!e.message.includes("404")) setError(e.message);
          setFallAnalysis(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token, role, selectedPatient?.username, fallDate, tick]);

  // ── Derived Data for UI ───────────────────────────────────────────────────

  const latestRecord = useMemo(
    () => (records.length > 0 ? records[records.length - 1] : null),
    [records],
  );

  const latestGaitData = useMemo(
    () => (latestRecord ? toGaitData(latestRecord) : null),
    [latestRecord],
  );

  const periodGaitData = useMemo(() => {
    if (role === "caretaker") {
      return selectedDateRecord ? toGaitData(selectedDateRecord) : null;
    }

    if (records.length === 0) return null;

    if (period === "daily") {
      const todayStr = toLocalISODate(new Date());
      const targetDate = selectedDate || todayStr;
      const targetRecord = records.find((r) => r.report_date === targetDate);
      return targetRecord ? toGaitData(targetRecord) : null;
    }

    // Weekly/Yearly aggregation logic
    const today = new Date();
    const cutoff = new Date(today);
    if (period === "weekly") cutoff.setDate(today.getDate() - 7);
    else cutoff.setFullYear(today.getFullYear() - 1);

    const cutoffStr = toLocalISODate(cutoff);
    const windowRecords = records.filter((r) => r.report_date >= cutoffStr);
    
    if (windowRecords.length === 0) return null;

    const avg = avgRecords(windowRecords);
    return avg ? toGaitData(avg) : null;
  }, [records, period, role, selectedDateRecord, selectedDate]);

  const selectedDateGaitData = useMemo(() => {
    if (role === "caretaker") return null;
    if (!selectedDate || records.length === 0) return null;
    const record = records.find((r) => r.report_date === selectedDate);
    return record ? toGaitData(record) : null;
  }, [records, selectedDate, role]);

  const availableDates = useMemo(
    () => records.map((r) => r.report_date),
    [records],
  );

  return {
    periodGaitData,
    selectedDateGaitData,
    availableDates,
    latestGaitData,
    latestRecord,
    fallAnalysis,
    loading,
    error,
    refresh,
  };
};