import { WindowReport } from "@/types/metric";
import { v4 as uuidv4 } from "uuid";

/**
 * Interface for cumulative session totals displayed on the UI
 */
export type SessionTotals = {
  steps: number;
  distanceM: number;
  kcal: number;
};

/**
 * Initializes empty session totals
 */
export const createEmptySessionTotals = (): SessionTotals => ({
  steps: 0,
  distanceM: 0,
  kcal: 0,
});

/**
 * Generates a mock WindowReport for testing UI flows without active sensor data.
 * All fields match the PostgreSQL snake_case schema.
 */
export function generateMockWindowReport(patientId: number): WindowReport {
  const anomalyScore = +(Math.random() * 0.5).toFixed(3);

  // Logic to determine gait health based on anomaly score thresholds
  let health = "healthy";
  if (anomalyScore > 0.4) health = "at_risk";
  else if (anomalyScore > 0.25) health = "moderate";

  return {
    window_report_id: uuidv4(),
    patient_id: patientId,
    timestamp: new Date().toISOString(),
    status: Math.random() > 0.1 ? "MONITORING" : "CALIBRATING",
    gait_health: health,
    anomaly_score: anomalyScore,
    max_gyr_ms: +(1.5 + Math.random() * 2).toFixed(2),
    val_gyr_hs: +(0.8 + Math.random() * 1.2).toFixed(2),
    swing_time: +(0.35 + Math.random() * 0.15).toFixed(3),
    stance_time: +(0.55 + Math.random() * 0.2).toFixed(3),
    stride_time: +(0.9 + Math.random() * 0.3).toFixed(3),
    stride_cv: +(2.0 + Math.random() * 6.0).toFixed(2), // Variability in percentage
    n_strides: Math.floor(20 + Math.random() * 40),
    steps: Math.floor(40 + Math.random() * 80),
    calories: +(1.0 + Math.random() * 5.0).toFixed(1),
    distance_m: +(5.0 + Math.random() * 30.0).toFixed(1),
  } as WindowReport;
}

/**
 * Formats duration from total seconds to MM:SS string
 */
export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Sanitizes and labels the current model status
 */
export const modelStatusLabel = (status: string | null): string => {
  if (!status) return "INITIALIZING";
  const normalized = status.trim().toUpperCase();
  return normalized || "MONITORING";
};

/**
 * Maps gait health status to consistent theme colors
 */
export const healthColor = (health: string | null): string => {
  const normalized = (health ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "healthy":
    case "normal":
      return "#4CAF50";
    case "anomaly_detected":
    case "anomaly":
      return "#EF4444";
    default:
      return "#999999";
  }
};

/**
 * Formats gait health status for display
 */
export const healthLabel = (health: string | null): string => {
  const normalized = (health ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (!normalized) return "UNKNOWN";
  if (normalized === "at_risk") return "AT-RISK";
  if (normalized === "moderate") return "MODERATE";
  if (normalized === "healthy") return "HEALTHY";
  if (normalized === "normal") return "NORMAL";
  if (normalized === "anomaly_detected") return "ANOMALY DETECTED";
  return normalized.replace(/_/g, " ").toUpperCase();
};
