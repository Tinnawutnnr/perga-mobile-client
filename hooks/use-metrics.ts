import { GaitData, Metric } from "@/types/metric";
import { fmt } from "@/utils/format";
import { useRouter } from "expo-router";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Total Steps",
      infoText:
        "How many steps you took today. More steps generally means better daily activity and mobility. If this drops far below your usual pattern, it may suggest pain, fatigue, or less confidence to move around.",
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
        "Steps per minute — your walking rhythm. A normal range is 90–130 steps/min. Below 90 usually means walking slowly and carefully. Above 130 can mean steps are rushed and harder to control.",
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
        data.cadence < 70 || data.cadence > 150
          ? "error"
          : data.cadence < 90 || data.cadence > 130
            ? "warning"
            : "success",
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
        "How fast the leg swings forward with each step. Normal range is 4.5–10.0 rad/s. Too low often means the foot is barely leaving the ground. Too high can mean the movement is jerky and harder to balance.",
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
        data.swingSpeed < 2 || data.swingSpeed > 12
          ? "error"
          : data.swingSpeed < 4.5 || data.swingSpeed > 10
            ? "warning"
            : "success",
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
        "How hard the foot hits the ground each step. Normal range is −4.5 to −1.5 rad/s. A value close to zero means the person is stepping very softly — often because the foot hurts. A very negative value means landing too hard, which puts extra stress on the joints.",
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
        data.heelImpact < -6 || data.heelImpact > -0.5
          ? "error"
          : data.heelImpact < -4.5 || data.heelImpact > -1.5
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
        "How long the foot stays off the ground between steps. Normal range is 0.35–0.55s. Too short often means the feet are sliding along rather than lifting properly. Too long means the timing between steps is uneven, which can affect balance.",
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
        "How long the foot stays on the ground while taking weight. Normal range is 0.55–0.95s. Longer than usual often means the person is being careful and leaning on that foot. Shorter than usual can mean steps feel rushed or unstable.",
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
      label: "Step Inconsistency",
      infoText:
        "How similar each step is to the next, shown as a percentage. Normal is below 5.5%. Between 5.5–8.8% suggests the rhythm is getting uneven. Above 8.8% is a real warning sign for fall risk.",
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
