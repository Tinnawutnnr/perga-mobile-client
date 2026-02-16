import { GaitData, Metric } from "@/types/metric";
import { useRouter } from "expo-router";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Total Steps",
      value: Math.floor(data.distance * 1312).toLocaleString(),
      subValue: "steps",
      // goal
      status: data.distance > 6 ? "Reached Goal" : "Keep going",
      statusColor: "info",
      iconName: "walk-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Total Steps" },
        }),
    },
    {
      label: "Cadence",
      value: data.cadence.toString(),
      subValue: "steps/min",
      // normal walk: 90-115 (Optimal), < 90 (Slow), > 115 (Brisk Walking)
      status:
        data.cadence < 90
          ? "Slow Pace"
          : data.cadence <= 115
            ? "Optimal"
            : "Brisk Walk",
      statusColor: data.cadence < 90 ? "warning" : "success",
      iconName: "timer-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Cadence" },
        }),
    },
    {
      label: "Swing Speed",
      value: data.swingSpeed.toString(),
      subValue: "deg/s",
      // Foot swing: low values may indicate a shuffling gait
      status: data.swingSpeed < 200 ? "Low Lift" : "Active Swing",
      statusColor: data.swingSpeed < 200 ? "warning" : "success",
      iconName: "speedometer-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Swing Speed" },
        }),
    },
    {
      label: "Heel Impact",
      value: data.heelImpact.toString(),
      subValue: "g",
      // Heel strike: avoid high impact to protect joints
      status: data.heelImpact > 2.5 ? "Hard Strike" : "Soft Landing",
      statusColor: data.heelImpact > 2.5 ? "warning" : "success",
      iconName: "footsteps-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Heel Impact" },
        }),
    },
    {
      label: "Step Duration",
      value: data.stepDuration.toString(),
      subValue: "s",
      // Step rhythm: normal walking is about 0.5 - 0.7 seconds per step
      status: data.stepDuration > 0.8 ? "Long Stride" : "Consistent",
      statusColor: data.stepDuration > 0.8 ? "warning" : "success",
      iconName: "hourglass-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Step Duration" },
        }),
    },
    {
      label: "Stability",
      value: data.stability + "%",
      subValue: "(CV)",
      // Walking stability: higher percentage (lower CV) is better
      status: data.stability < 80 ? "Unstable" : "Balanced",
      statusColor: data.stability < 80 ? "danger" : "success",
      iconName: "analytics-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Stability" },
        }),
    },
  ];

  return metricsConfig;
};
