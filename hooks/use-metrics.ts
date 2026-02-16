import { useRouter } from "expo-router";
import { GaitData, Metric } from "@/types/metric";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Cadence",
      value: data.cadence.toString(),
      subValue: "steps/min",
      status: "Optimal",
      iconName: "timer-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Cadence" } }),
    },
    {
      label: "Total Steps",
      value: Math.floor(data.distance * 1312).toLocaleString(), 
      subValue: "steps",
      status: data.distance > 20 ? "Goal Hit" : "Keep Going",
      statusColor: data.distance > 20 ? "success" : "warning",
      iconName: "walk-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Total Steps" } }),
    },
    {
      label: "Calories",
      value: Math.floor(data.distance * 65).toString(),
      subValue: "kcal",
      status: "Good Burn",
      iconName: "flame-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Calories" } }),
    },
    {
      label: "Swing Speed",
      value: data.swingSpeed.toString(),
      subValue: "deg/s",
      status: "Strong",
      iconName: "speedometer-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Swing Speed" } }),
    },
    {
      label: "Heel Impact",
      value: data.heelImpact.toString(),
      subValue: "g",
      status: "Normal",
      iconName: "footsteps-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Heel Impact" } }),
    },
    {
      label: "Step Duration",
      value: data.stepDuration.toString(),
      subValue: "s",
      status: "Normal",
      iconName: "hourglass-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Step Duration" }}),
    },
    {
      label: "Stability",
      value: data.stability + "%",
      subValue: "(CV)",
      status: "Stable",
      iconName: "analytics-outline",
      onPress: () => router.push({ pathname: "/(tabs)/metric-detail", params: { label: "Stability" } }),
    },
  ];

  return metricsConfig;
};