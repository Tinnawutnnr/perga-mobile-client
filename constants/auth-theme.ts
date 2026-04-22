/**
 * Design tokens for the PERGA auth and onboarding flow.
 *
 * Colors are derived from OKLCH perceptual space and tinted toward the brand
 * hue (teal ~195°) for cohesion — even neutrals carry a trace of the brand.
 *
 * React Native does not yet parse oklch() at runtime, so values are
 * pre-computed hex equivalents.
 */

// ── Welcome screen has a fixed identity; it does not adapt to color scheme ──
export const WelcomeColors = {
  background: '#1C3538',
  wordmark: '#EFF8F9',
  tagline: '#7DB5BB',
  divider: '#2E5055',
  buttonPrimaryBg: '#EFF8F9',
  buttonPrimaryText: '#1C3538',
  buttonGhostText: '#7DB5BB',
} as const;

// ── Semantic palette per theme ───────────────────────────────────────────────
export const AuthPalette = {
  light: {
    background: '#F5F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#ECF5F6',

    textPrimary: '#18292B',
    textSecondary: '#496165',
    textMuted: '#8BAAAD',
    textLabel: '#2D4547',
    textPlaceholder: '#92B2B5',

    border: '#CDDFE1',
    borderFocus: '#4F7D81',
    borderError: '#C44444',

    tint: '#4F7D81',
    tintPressed: '#3E6468',
    tintPale: '#E6F1F2',

    error: '#C44444',
    errorSubtle: '#FEF2F2',

    buttonDisabled: '#B8CECE',
  },
  dark: {
    background: '#0E1B1D',
    surface: '#162324',
    surfaceElevated: '#1A2E30',

    textPrimary: '#EBF4F5',
    textSecondary: '#87B3B8',
    textMuted: '#547779',
    textLabel: '#A4C5C8',
    textPlaceholder: '#3D5E61',

    border: '#2B4145',
    borderFocus: '#8BBAC0',
    borderError: '#C44444',

    tint: '#8BBAC0',
    tintPressed: '#6E9EA3',
    tintPale: '#1A3133',

    error: '#E06B6B',
    errorSubtle: '#2D1717',

    buttonDisabled: '#243538',
  },
} as const;

// ── Spacing (4pt base) ───────────────────────────────────────────────────────
export const AuthSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ── Radii ────────────────────────────────────────────────────────────────────
export const AuthRadius = {
  sm: 8,
  md: 12,
  lg: 14,
} as const;
