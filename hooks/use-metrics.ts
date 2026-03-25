import { GaitData, Metric } from "@/types/metric";
import { useRouter } from "expo-router";

export const useMetrics = (data: GaitData) => {
  const router = useRouter();

  const metricsConfig: Metric[] = [
    {
      label: "Total Steps",
      infoText:
        "Shows how much you walk each day. A significant drop means you might be feeling tired or afraid of falling.",
      value: (data.totalSteps ?? 0).toLocaleString(),
      subValue: "steps",
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
      infoText:
        "Shows your walking rhythm. A steady speed helps you walk safely without getting tired quickly.",
      value: data.cadence.toString(),
      subValue: "steps/min",
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
      infoText:
        "Measures how fast you swing your leg forward. A slow swing means your muscles might be weak, which makes you drag your feet.",
      value: data.swingSpeed.toString(),
      subValue: "rad/s",
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
      infoText:
        "Measures how hard your foot hits the ground. Hitting too hard hurts your joints. A very light step means you might be limping to avoid pain.",
      value: data.heelImpact.toString(),
      subValue: "rad/s",
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
      infoText:
        "Measures how long your foot is in the air. A short time means you are taking tiny steps or dragging your feet, which can cause a trip.",
      value: data.swingTime.toString(),
      subValue: "s",
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
      infoText:
        "Measures how long your foot rests on the ground. Resting too long means you are walking stiffly. Lifting it too fast means your leg hurts.",
      value: data.stanceTime.toString(),
      subValue: "s",
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
      infoText:
        "Measures how steady your steps are. If your steps are uneven, you have a high risk of falling.",
      value: data.stability + "%",
      subValue: "CV",
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
