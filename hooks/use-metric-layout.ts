import { useWindowDimensions } from "react-native";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const useMetricLayout = () => {
  const { width } = useWindowDimensions();
  const scale = clamp(width / 390, 0.82, 1.15);

  return {
    scale,
    cardPadding: clamp(Math.round(16 * scale), 12, 18),
    horizontalPadding: clamp(Math.round(16 * scale), 12, 20),
    weekChartHeight: clamp(Math.round(170 * scale), 140, 195),
    barTrackHeight: clamp(Math.round(132 * scale), 108, 152),
    compareChartHeight: clamp(Math.round(112 * scale), 96, 132),
    pageTitleSize: clamp(28 * scale, 22, 28),
    heroValueSize: clamp(36 * scale, 28, 40),
    heroUnitSize: clamp(15 * scale, 13, 17),
    statusSize: clamp(16 * scale, 14, 18),
    sectionTitleSize: clamp(20 * scale, 17, 22),
    bodySize: clamp(15 * scale, 13, 16),
    goalSize: clamp(18 * scale, 15, 20),
    labelSize: clamp(14 * scale, 12, 15),
    scaledClamp: (value: number, min: number, max: number, round = false) => {
      const v = round ? Math.round(value * scale) : value * scale;
      return clamp(v, min, max);
    },
  };
};

export { clamp };
