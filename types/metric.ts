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
};