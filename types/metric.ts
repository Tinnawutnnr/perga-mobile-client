import { Ionicons } from "@expo/vector-icons";
export type IconName = keyof typeof Ionicons.glyphMap;

export interface GaitData {
  distance: number;
  cadence: number;
  swingSpeed: number;
  heelImpact: number;
  stepDuration: number;
  stability: number;
}

export interface Metric {
  label: string;
  value: string;
  subValue: string;
  status: string;
  statusColor?: "success" | "warning" | "danger" | "info";
  iconName: IconName;
  onPress: () => void;
}

export interface MetricDetailData {
  value: string;
  subValue: string;
  status: string;
  statusColor: string;
  minLabel: string;
  maxLabel: string;
  goalLabel: string;
  progress: number;
  weekly: number[];
  compareText: string;
  compareBars: number[];
  articleTitle: string;
  articleBody: string;
  iconName: IconName;
}

export interface DailyAverage {
  daily_report_id: string;
  patient_id: number;
  report_date: string; // "YYYY-MM-DD"
  total_windows_analyzed: number;
  total_steps: number;
  total_calories: number;
  total_distance_m: number;
  avg_max_gyr_ms: number; // swing speed
  avg_val_gyr_hs: number; // heel impact
  avg_swing_time: number;
  avg_stance_time: number;
  avg_stride_cv: number; // stride variability (lower = more stable)
  anomaly_count: number;
}

export interface WindowReport {
  window_report_id: string;
  patient_id: number;
  timestamp: string;
  status: string;
  gait_health: string;
  anomaly_score: number;
  max_gyr_ms: number;
  val_gyr_hs: number;
  swing_time: number;
  stance_time: number;
  stride_time: number;
  stride_cv: number;
  n_strides: number;
  steps: number;
  calories: number;
  distance_m: number;
}
