import { GaitData, Metric } from "@/types/metric";
import { fmt } from "@/utils/format";
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
      status:
        data.totalSteps < 500
          ? "Very Low Activity"
          : data.totalSteps < 5000
            ? "Keep moving"
            : "Active Day",
      statusColor: data.totalSteps < 5000 ? "warning" : "success",
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
        "The number of steps you take per minute. 100 steps/min is the 'Gold Standard' for healthy walking.", // Fixed typo here
      value: fmt(data.cadence, 1),
      subValue: "steps/min",
      status:
        data.cadence < 70
          ? "Out-of-Range Slow"
          : data.cadence < 90
            ? "Slow Pace"
            : data.cadence <= 130
              ? "Optimal"
              : data.cadence <= 150
                ? "Brisk/Fast"
                : "Out-of-Range Fast",
      statusColor:
        data.cadence < 90 || data.cadence > 130 ? "warning" : "success", // Kept Brisk/Fast as a warning for elderly fall-risk
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
        "The highest speed your leg reaches in the air. Lower values (below 4.5 rad/s) often suggest muscle weakness or dragging feet instead of lifting them.",
      value: fmt(data.swingSpeed, 2),
      subValue: "rad/s",
      status:
        data.swingSpeed < 2
          ? "Out-of-Range Low"
          : data.swingSpeed < 4.5
            ? "Low Power"
            : data.swingSpeed <= 10
              ? "Strong Drive"
              : data.swingSpeed <= 12
                ? "Atypically High"
                : "Out-of-Range High",
      statusColor:
        data.swingSpeed < 4.5 || data.swingSpeed > 10 ? "warning" : "success",
      iconName: "speedometer-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Swing Speed" },
        }),
    },
    {
      label: "Foot Landing Force",
      infoText:
        "Measures how the leg absorbs shock. If this is close to zero (e.g., > -1.5), you are likely placing your foot down cautiously to avoid pain.",
      value: fmt(data.heelImpact, 2),
      subValue: "rad/s",
      status:
        data.heelImpact < -6
          ? "Out-of-Range Heavy"
          : data.heelImpact < -4.5
            ? "Landing Heavily"
            : data.heelImpact <= -1.5
              ? "Controlled"
              : data.heelImpact <= -0.5
                ? "Limping/Guarding"
                : "Out-of-Range Guarding",
      statusColor:
        data.heelImpact < -4.5 || data.heelImpact > -1.5
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
      label: "In-Air Time",
      infoText:
        "How long your foot stays in the air. A consistent time between 0.35s and 0.50s indicates a healthy, clearing stride.",
      value: fmt(data.swingTime, 3),
      subValue: "s",
      status:
        data.swingTime < 0.25
          ? "Out-of-Range Short"
          : data.swingTime < 0.35
            ? "Dragging Feet"
            : data.swingTime <= 0.55
              ? "Normal"
              : data.swingTime <= 0.75
                ? "Slow Swing"
                : "Out-of-Range Long",
      statusColor:
        data.swingTime < 0.35 || data.swingTime > 0.55 ? "warning" : "success",
      iconName: "hourglass-outline",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Swing Time" },
        }),
    },
    {
      label: "On-Ground Time",
      infoText:
        "The time your foot is weight-bearing. Values over 0.95s indicate a cautious walk or dragging feet, often used to compensate for poor balance.",
      value: fmt(data.stanceTime, 3),
      subValue: "s",
      status:
        data.stanceTime < 0.45
          ? "Out-of-Range Short"
          : data.stanceTime < 0.55
            ? "Brief Contact"
            : data.stanceTime <= 0.95
              ? "Normal"
              : data.stanceTime <= 1.2
                ? "Stiff/Cautious"
                : "Out-of-Range Long",
      statusColor:
        data.stanceTime < 0.55 || data.stanceTime > 0.95
          ? "warning"
          : "success",
      iconName: "footsteps",
      onPress: () =>
        router.push({
          pathname: "/(tabs)/metric-detail",
          params: { label: "Stance Time" },
        }),
    },
    {
      label: "Step Consistency",
      infoText:
        "Measures rhythm consistency. Values above 8.8% indicate severe instability and an elevated risk of falling.",
      value: fmt(data.stability, 1) + "%",
      subValue: "CV",
      status:
        data.stability < 0
          ? "Out-of-Range"
          : data.stability > 8.8
            ? "High Fall Risk"
            : data.stability > 5.5
              ? "Unsteady"
              : "Stable",
      statusColor:
        data.stability < 0 || data.stability > 5.5 ? "warning" : "success",
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
