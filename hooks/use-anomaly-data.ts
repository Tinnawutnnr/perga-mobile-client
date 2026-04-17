import { caregiverApi } from "@/api/caregiver";
import { patientApi } from "@/api/patient";
import { useAuth } from "@/context/auth-context";
import { usePatientStore } from "@/store/patient-store";
import { AnomalyLog, AnomalyLogSchema } from "@/types/anomaly";
import { useEffect, useState } from "react";

export function calculatePercentDiff(
  current: number | null,
  ref: number | null,
): string {
  if (current === null || ref === null || ref === 0) return "-";
  const diff = current - ref;
  const percent_diff = (diff / Math.abs(ref)) * 100;
  const formatted = percent_diff.toFixed(1);
  return diff > 0 ? `+${formatted}%` : `${formatted}%`;
}

export type AnomalyScale = "day" | "week" | "month" | "year";

export interface AnomalyChartPoint {
  label: string; // display label on X-axis
  count: number; // number of anomalies in that bucket
  entries: AnomalyLog[]; // raw entries for detail modal
}

/**
 * Filters the flat list of AnomalyLogs to a specific timeframe
 * and groups them into chart buckets.
 */
function groupAnomalies(
  entries: AnomalyLog[],
  scale: AnomalyScale,
): AnomalyChartPoint[] {
  const bucketMap: Map<string, AnomalyLog[]> = new Map();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Filter entries into correct timeframe
  const filteredEntries = entries.filter((entry) => {
    const d = new Date(entry.timestamp);
    if (scale === "day") {
      // Must be today
      return d.getTime() >= todayStart.getTime();
    } else if (scale === "week") {
      // Must be within last 7 days
      const weekAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
      return d.getTime() >= weekAgo.getTime();
    } else if (scale === "month") {
      // Must be within last 30 days
      const monthAgo = new Date(
        todayStart.getTime() - 29 * 24 * 60 * 60 * 1000,
      );
      return d.getTime() >= monthAgo.getTime();
    } else if (scale === "year") {
      // Must be this year
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // 2. Group the filtered entries into buckets
  for (const entry of filteredEntries) {
    const d = new Date(entry.timestamp);
    let key: string;

    switch (scale) {
      case "day":
        // Group by hour: "08:00"
        key = String(d.getHours()).padStart(2, "0") + ":00";
        break;
      case "week":
      case "month":
        // Group by date: "2026-03-25"
        key = d.toISOString().slice(0, 10);
        break;
      case "year":
        // Group by month: "2026-03"
        key = d.toISOString().slice(0, 7);
        break;
      default:
        key = d.toISOString().slice(0, 10);
    }

    if (!bucketMap.has(key)) bucketMap.set(key, []);
    bucketMap.get(key)!.push(entry);
  }

  const sortedKeys = Array.from(bucketMap.keys()).sort();

  // 3. Format into ChartPoint array and format X-axis labels
  return sortedKeys.map((key) => {
    const items = bucketMap.get(key)!;
    let label = key;

    if (scale === "week" || scale === "month") {
      // Create user-friendly label (e.g. 25/03)
      const [, mm, dd] = key.split("-");
      label = `${dd}/${mm}`;
    } else if (scale === "year") {
      // e.g. "Mar 2026"
      const [yyyy, mm] = key.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      label = `${monthNames[parseInt(mm) - 1]} ${yyyy}`;
    }
    // "day" keeps key as label (e.g., "08:00")

    return { label, count: items.length, entries: items };
  });
}

interface UseAnomalyDataResult {
  chartData: AnomalyChartPoint[];
  rawEntries: AnomalyLog[];
  loading: boolean;
  error: string | null;
  scale: AnomalyScale;
  setScale: (s: AnomalyScale) => void;
}

/**
 * Fetches anomaly log for either the logged-in patient or a caregiver's patient.
 * Pass `patientUsername` for caregiver mode; omit for patient (self) mode.
 */
export function useAnomalyData(): UseAnomalyDataResult {
  const { token, role } = useAuth();
  const [rawEntries, setRawEntries] = useState<AnomalyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<AnomalyScale>("day");
  const { selectedPatient } = usePatientStore();
  const patientUsername = selectedPatient?.username;

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const request: Promise<AnomalyLogSchema> =
      role === "caregiver" && patientUsername
        ? caregiverApi.getPatientAnomalyLog(patientUsername, token)
        : patientApi.getAnomalyLog(token);

    request
      .then((data) => setRawEntries(data ?? []))
      .catch((err) => setError(err?.message ?? "Failed to load anomaly data"))
      .finally(() => setLoading(false));
  }, [token, role, patientUsername]);

  const chartData = groupAnomalies(rawEntries, scale);

  return { chartData, rawEntries, loading, error, scale, setScale };
}
