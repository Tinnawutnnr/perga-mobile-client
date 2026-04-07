/**
 * Format number with flexible decimal places
 * Removes trailing zeros automatically
 * @param num - The number to format
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted string without trailing zeros
 */
export const fmt = (num: number, maxDecimals: number = 2): string => {
  const fixed = num.toFixed(maxDecimals);
  return String(parseFloat(fixed));
};