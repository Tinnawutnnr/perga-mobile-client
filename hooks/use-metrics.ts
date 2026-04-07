import { GaitData, Metric } from "@/types/metric";
import { useRouter } from "expo-router";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Total Steps",
      infoText:
        "Total count of steps today. A sudden decrease may indicate fatigue, recovery needs, or a decrease in overall mobility.",
      value: (data.totalSteps ?? 0).toLocaleString(),
      subValue: "steps",
      status: data.totalSteps > 5000 ? "Active Day" : "Keep moving",
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
      infoText:
        "The number of steps you take per minute. 100 steps/min is the 'Gold Standard' for healthy",
      value: data.cadence.toFixed(1),
      subValue: "steps/min",
      status:
        data.cadence < 90
          ? "Slow Pace"
          : data.cadence <= 130
            ? "Optimal"
            : "Brisk/Fast",
      statusColor: data.cadence < 90 ? "warning" : "success",
      iconName: "timer-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Cadence" },
        }),
    },
    {
      label: "Leg Swing Speed",
      infoText:
        "The highest speed your leg reaches in the air. Lower values (below 4.5 rad/s) often suggest muscle weakness or a 'guarded' walk.",
      value: data.swingSpeed.toFixed(2),
      subValue: "rad/s",
      status: data.swingSpeed < 4.5 ? "Low Power" : "Strong Drive",
      statusColor: data.swingSpeed < 4.5 ? "warning" : "success",
      iconName: "speedometer-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Leg Swing Speed" },
        }),
    },
    {
      label: "Foot Landing Force",
      infoText:
        "Measures how the leg absorbs shock. If this is close to zero (e.g., > -1.5), you are likely 'placing' your foot down gingerly to avoid pain.",
      value: data.heelImpact.toFixed(2),
      subValue: "rad/s",
      status:
        data.heelImpact < -4.5
          ? "Heavy Strike"
          : data.heelImpact > -1.5
            ? "Guarded/Limp"
            : "Controlled",
      statusColor:
        data.heelImpact < -4.5 || data.heelImpact > -1.5
          ? "warning"
          : "success",
      iconName: "footsteps-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Foot Landing Force" },
        }),
    },
    {
      label: "In-Air Time",
      infoText:
        "How long your foot stays in the air. A consistent time between 0.35s and 0.50s indicates a healthy, clearing stride.",
      value: data.swingTime.toFixed(3),
      subValue: "s",
      status:
        data.swingTime < 0.35
          ? "Shuffling"
          : data.swingTime > 0.55
            ? "Slow Swing"
            : "Normal",
      statusColor:
        data.swingTime < 0.35 || data.swingTime > 0.55 ? "error" : "success",
      iconName: "hourglass-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "In-Air Time" },
        }),
    },
    {
      label: "On-Ground Time",
      infoText:
        "The time your foot is weight-bearing. Values over 0.95s indicate a 'shuffling' gait often used to compensate for poor balance.",
      value: data.stanceTime.toFixed(3),
      subValue: "s",
      status:
        data.stanceTime > 0.95
          ? "Stiff/Cautious"
          : data.stanceTime < 0.55
            ? "Brief Contact"
            : "Normal",
      statusColor:
        data.stanceTime > 0.95
          ? "warning"
          : data.stanceTime < 0.55
            ? "error"
            : "success",
      iconName: "footsteps",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "On-Ground Time" },
        }),
    },
    {
      label: "Step Consistency",
      infoText:
        "Measures rhythm consistency. Values above 8.8% indicate severe instability and an elevated risk of falling.",
      value: data.stability.toFixed(1) + "%",
      subValue: "CV",
      status:
        data.stability > 8.8
          ? "High Fall Risk"
          : data.stability > 5.5
            ? "Unsteady"
            : "Stable",
      statusColor:
        data.stability > 8.8
          ? "error"
          : data.stability > 5.5
            ? "warning"
            : "success",
      iconName: "analytics-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Step Consistency" },
        }),
    },
  ];

  return metricsConfig;
};