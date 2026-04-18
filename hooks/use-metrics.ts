import { GaitData, Metric } from "@/types/metric";
import { fmt } from "@/utils/format";
import { useRouter } from "expo-router";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Total Steps",
      infoText:
        "How many steps you took today. In general, more steps means better daily activity and mobility. If this drops far below your normal pattern, it may suggest pain, fatigue, or less confidence to move.",
      value: (data.totalSteps ?? 0).toLocaleString(),
      subValue: "steps",
      status: "Keep moving",
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
        "Steps per minute (walking rhythm). A normal range shows steady, confident walking. Low cadence means slower and more cautious gait; very high cadence can mean rushed or less controlled stepping.",
      value: fmt(data.cadence, 1),
      subValue: "steps/min",
      status:
        data.cadence < 70
          ? "Very Slow Pace"
          : data.cadence < 90
            ? "Slow Pace"
            : data.cadence <= 130
              ? "Optimal"
              : data.cadence <= 150
                ? "Brisk/Fast"
                : "Rushed Pace",
      statusColor:
        data.cadence < 90 || data.cadence > 130 ? "warning" : "success",
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
        "How fast the leg swings forward during each step. Lower values often mean weak push-off and poor foot lift, which raises trip risk. Very high values can mean forceful or less controlled movement.",
      value: fmt(data.swingSpeed, 2),
      subValue: "rad/s",
      status:
        data.swingSpeed < 2
          ? "Minimal Leg Lift"
          : data.swingSpeed < 4.5
            ? "Low Power"
            : data.swingSpeed <= 10
              ? "Strong Drive"
              : data.swingSpeed <= 12
                ? "Atypically High"
                : "Overly Forceful",
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
        "How strongly the foot lands on the ground. Near-normal values suggest controlled landing. Too close to zero can indicate guarding due to pain; very negative values indicate heavier impact and more joint stress.",
      value: fmt(data.heelImpact, 2),
      subValue: "rad/s",
      status:
        data.heelImpact < -6
          ? "Very Heavy Impact"
          : data.heelImpact < -4.5
            ? "Landing Heavily"
            : data.heelImpact <= -1.5
              ? "Controlled"
              : data.heelImpact <= -0.5
                ? "Limping/Guarding"
                : "Extreme Guarding",
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
        "How long the foot stays in the air between steps. Too short often means dragging or shuffling. Too long may reflect unstable timing and reduced balance control.",
      value: fmt(data.swingTime, 3),
      subValue: "s",
      status:
        data.swingTime < 0.25
          ? "Barely Lifting"
          : data.swingTime < 0.35
            ? "Dragging Feet"
            : data.swingTime <= 0.55
              ? "Normal"
              : data.swingTime <= 0.75
                ? "Slow Swing"
                : "Prolonged Swing",
      statusColor:
        data.swingTime < 0.25 || data.swingTime > 0.75
          ? "error"
          : data.swingTime < 0.35 || data.swingTime > 0.55
            ? "warning"
            : "success",
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
        "How long the foot stays on the ground while bearing weight. Slightly longer can be careful walking, but very long often means cautious compensation. Too short may indicate rushed, unstable steps.",
      value: fmt(data.stanceTime, 3),
      subValue: "s",
      status:
        data.stanceTime < 0.45
          ? "Rushed Step"
          : data.stanceTime < 0.55
            ? "Brief Contact"
            : data.stanceTime <= 0.95
              ? "Normal"
              : data.stanceTime <= 1.2
                ? "Stiff/Cautious"
                : "Highly Cautious",
      statusColor:
        data.stanceTime < 0.45 || data.stanceTime > 1.2
          ? "error"
          : data.stanceTime < 0.55 || data.stanceTime > 0.95
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
        "How similar each step is to the next (CV%). Lower values mean a steadier rhythm. Higher values mean step pattern is irregular and less stable, which is linked to higher fall risk.",
      value: fmt(data.stability, 1) + "%",
      subValue: "CV",
      status:
        data.stability < 0
          ? "Calculating..."
          : data.stability > 8.8
            ? "High Fall Risk"
            : data.stability > 5.5
              ? "Unsteady"
              : "Stable",
      statusColor:
        data.stability < 0 || data.stability > 8.8
          ? "error"
          : data.stability > 5.5
            ? "warning"
            : "success",
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
