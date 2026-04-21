/**
 * Colors for light and dark themes in PGAD mobile app
 */

import { Platform } from "react-native";

const tintColorLight = "#4F7D81";
const tintColorDark = "#8BBAC0";

export const Colors = {
  light: {
    // Off-white tinted toward teal — matches auth screen background
    text: "#0E1A1C",
    background: "#F5F9FA",
    tint: tintColorLight,
    icon: "#4F6B70",
    tabIconDefault: "#A8B8BB",
    tabIconSelected: tintColorLight,
    // Pure white cards lift off the tinted background
    card: "#FFFFFF",
    cardborder: "#DDE8EA",
    border: "#DDE8EA",
    muted: "#5A7378",
    accent: "#FF8C1A",
    success: "#3D9E51",
    warning: "#C97A00",
    error: "#D93025",
    info: "#6B7F85",
    surface: "#FFFFFF",
    onSurface: "#0E1A1C",
  },
  dark: {
    // Deep teal-tinted dark — no pure black
    text: "#E4F0F2",
    background: "#0B1618",
    tint: tintColorDark,
    icon: "#8BBAC0",
    tabIconDefault: "#4A6468",
    tabIconSelected: tintColorDark,
    // Card and border are now distinct depths
    card: "#131F22",
    cardborder: "#1C2F34",
    border: "#1C2F34",
    // Teal-tinted muted — not harsh gray
    muted: "#6E9298",
    accent: "#FFA726",
    success: "#5BAD6A",
    warning: "#D4A017",
    error: "#E05252",
    info: "#7A9AA0",
    surface: "#131F22",
    onSurface: "#E4F0F2",
  },
};

/**
 * Fixed rem-equivalent type scale for app UI.
 * Ratio ≈ 1.25 between steps; keeps hierarchy readable at a glance.
 */
export const TypeScale = {
  caption:    { fontSize: 12, lineHeight: 17, letterSpacing: 0.1  },
  secondary:  { fontSize: 13, lineHeight: 19, letterSpacing: 0.05 },
  body:       { fontSize: 16, lineHeight: 24, letterSpacing: 0    },
  bodySemi:   { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: "600" as const },
  subheading: { fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
  heading:    { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  display:    { fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
