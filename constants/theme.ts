/**
 * Colors for light and dark themes in PGAD mobile app
 */

import { Platform } from 'react-native';

const tintColorLight = '#4F7D81';
const tintColorDark = '#8BBAC0';

export const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#C0C0C0",
    tabIconSelected: tintColorLight,
    card: "#F8F9FA",
    cardborder: "#E9ECEF",
    border: "#E9ECEF",
    muted: "#666666",
    accent: "#FF8C1A",
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#FF4444",
    surface: "#FFFFFF",
    onSurface: "#1a1a1a",
  },
  dark: {
    text: "#FFFFFF",
    background: "#000000",
    tint: tintColorDark,
    icon: "#FFFFFF",
    tabIconDefault: "#666666",
    tabIconSelected: tintColorDark,
    card: "#1A1A1A",
    cardborder: "#121212",
    border: "#1A1A1A",
    muted: "#CCCCCC",
    accent: "#FFA726",
    success: "#66BB6A",
    warning: "#FFCA28",
    error: "#EF5350",
    surface: "#1A1A1A",
    onSurface: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});