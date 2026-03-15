import { WindowReport } from "@/types/metric";
import { v4 as uuidv4 } from "uuid";

export type SessionTotals = {
  steps: number;
  distanceM: number;
  kcal: number;
};

export const createEmptySessionTotals = (): SessionTotals => ({
  steps: 0,
  distanceM: 0,
  kcal: 0,
});

// Mock window payload to validate UI flow without BLE/MQTT dependencies.
export function generateMockWindowReport(patientId: number): WindowReport {
  return {
    window_report_id: uuidv4(),
    patient_id: patientId,
    timestamp: new Date().toISOString(),
    status: Math.random() > 0.3 ? "MONITORING" : "CALIBRATING",
    gait_health: ["healthy", "moderate", "at_risk"][
      Math.floor(Math.random() * 3)
    ],
    anomaly_score: +(Math.random() * 0.5).toFixed(3),
    max_gyr_ms: +(1.5 + Math.random() * 2).toFixed(2),
    val_gyr_hs: +(0.8 + Math.random() * 1.2).toFixed(2),
    swing_time: +(0.35 + Math.random() * 0.15).toFixed(3),
    stance_time: +(0.55 + Math.random() * 0.2).toFixed(3),
    stride_time: +(0.9 + Math.random() * 0.3).toFixed(3),
    stride_cv: +(2 + Math.random() * 6).toFixed(2),
    n_strides: Math.floor(20 + Math.random() * 40),
    steps: Math.floor(40 + Math.random() * 80),
    calories: +(1 + Math.random() * 5).toFixed(1),
    distance_m: +(5 + Math.random() * 30).toFixed(1),
  };
}

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const modelStatusLabel = (status: string): string => {
  const normalized = status.trim().toUpperCase();
  if (normalized === "CALIBRATING") return "CALIBRATING";
  if (normalized === "MONITORING") return "MONITORING";
  return "MONITORING";
};

export const healthColor = (health: string): string => {
  switch (health) {
    case "healthy":
      return "#4CAF50";
    case "moderate":
      return "#FF9800";
    case "at_risk":
      return "#FF5252";
    default:
      return "#999";
  }
};

export const healthLabel = (health: string): string => {
  if (health === "at_risk") return "AT-RISK";
  if (health === "moderate") return "MODERATE";
  if (health === "healthy") return "HEALTHY";
  return health.replace(/_/g, " ").toUpperCase();
};
