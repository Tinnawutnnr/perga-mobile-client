import { useEffect, useState } from "react";
import { patientApi } from "@/api/patient";
import { caretakerApi } from "@/api/caretaker";
import { AnomalyLog, AnomalyLogSchema } from "@/types/anomaly";
import { useAuth } from "@/context/auth-context";
import { usePatientStore } from "@/store/patient-store";

export function calculatePercentDiff(current: number | null, ref: number | null): string {
  if (current === null || ref === null || ref === 0) return "-";
  const diff = current - ref;
  const percent_diff = (diff / Math.abs(ref)) * 100;
  const formatted = percent_diff.toFixed(1);
  return diff > 0 ? `+${formatted}%` : `${formatted}%`;
}

export type AnomalyScale = "day" | "week" | "month" | "year";

export interface AnomalyChartPoint {
  label: string;           // display label on X-axis
  count: number;           // number of anomalies in that bucket
  entries: AnomalyLog[];   // raw entries for detail modal
}

/**
 * Groups a flat list of AnomalyLog into chart buckets based on the chosen scale.
 */
function groupAnomalies(
  entries: AnomalyLog[],
  scale: AnomalyScale
): AnomalyChartPoint[] {
  const bucketMap: Map<string, AnomalyLog[]> = new Map();

  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    let key: string;

    switch (scale) {
      case "day": {
        key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
        break;
      }
      case "week": {
        const jan4 = new Date(d.getFullYear(), 0, 4);
        const weekNum = Math.ceil(
          ((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7
        );
        key = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
        break;
      }
      case "month": {
        key = d.toISOString().slice(0, 7); // "YYYY-MM"
        break;
      }
      case "year": {
        key = String(d.getFullYear());
        break;
      }
    }

    if (!bucketMap.has(key)) bucketMap.set(key, []);
    bucketMap.get(key)!.push(entry);
  }

  const sortedKeys = Array.from(bucketMap.keys()).sort();

  return sortedKeys.map((key) => {
    const items = bucketMap.get(key)!;
    let label = key;

    if (scale === "day") {
      const [, mm, dd] = key.split("-");
      label = `${dd}/${mm}`;
    } else if (scale === "month") {
      const [yyyy, mm] = key.split("-");
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      label = `${monthNames[parseInt(mm) - 1]} ${yyyy}`;
    }
    // week → "2026-W14", year → "2026" — keep as-is

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
 * Fetches anomaly log for either the logged-in patient or a caretaker's patient.
 * Pass `patientUsername` for caretaker mode; omit for patient (self) mode.
 */
export function useAnomalyData(): UseAnomalyDataResult {
  const { token, role } = useAuth();
  const [rawEntries, setRawEntries] = useState<AnomalyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<AnomalyScale>("day");
  const {selectedPatient} = usePatientStore();
  const patientUsername = selectedPatient?.username;

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const request: Promise<AnomalyLogSchema> =
      role === "caretaker" && patientUsername
        ? caretakerApi.getPatientAnomalyLog(patientUsername, token)
        : patientApi.getAnomalyLog(token);

    request
      .then((data) => setRawEntries(data ?? []))
      .catch((err) => setError(err?.message ?? "Failed to load anomaly data"))
      .finally(() => setLoading(false));
  }, [token, role, patientUsername]);

  const chartData = groupAnomalies(rawEntries, scale);

  return { chartData, rawEntries, loading, error, scale, setScale };
}