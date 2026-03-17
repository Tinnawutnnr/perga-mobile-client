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
      subValue: "rad/s",
      // Normal is around 5.0 rad/s. Below 3.0 suggests reduced swing.
      status: data.swingSpeed < 3.0 ? "Low Lift" : "Active Swing",
      statusColor: data.swingSpeed < 3.0 ? "warning" : "success",
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
      subValue: "rad/s",
      // Normal is around -2.1 rad/s.
      // More negative than -3.5 suggests hard strike.
      // Less negative than -1.0 suggests limping / reduced impact.
      status:
        data.heelImpact < -3.5
          ? "Hard Strike"
          : data.heelImpact > -1.0
            ? "Limping"
            : "Controlled",
      statusColor:
        data.heelImpact < -3.5 || data.heelImpact > -1.0
          ? "warning"
          : "success",
      iconName: "footsteps-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Heel Impact" },
        }),
    },
    {
      label: "Swing Time",
      value: data.swingTime.toString(),
      subValue: "s",
      // Healthy swing time is around 0.4s. If it drops significantly, it indicates shuffling.
      status: data.swingTime < 0.35 ? "Shuffling" : "Normal",
      statusColor: data.swingTime < 0.35 ? "error" : "success",
      iconName: "hourglass-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Swing Time" },
        }),
    },
    {
      label: "Stance Time",
      value: data.stanceTime.toString(),
      subValue: "s",
      // Healthy stance time is roughly 0.6s (~60% of cycle).
      // > 0.70s indicates cautious walking, < 0.50s indicates pain avoidance.
      status:
        data.stanceTime > 0.7
          ? "Cautious"
          : data.stanceTime < 0.5
            ? "Pain Avoidance"
            : "Normal",
      statusColor:
        data.stanceTime > 0.7
          ? "warning"
          : data.stanceTime < 0.5
            ? "error"
            : "success",
      iconName: "footsteps",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Stance Time" },
        }),
    },
    {
      label: "Stability",
      value: data.stability + "%",
      subValue: "CV",
      // CV is an error metric. Lower is better. Normal is 2-5%.
      status: data.stability > 10 ? "Unstable" : "Balanced",
      statusColor: data.stability > 10 ? "error" : "success",
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
