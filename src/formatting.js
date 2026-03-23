/**
 * Formatting Utilities
 *
 * Helpers for displaying currency, percentages, and other numeric values.
 */

/**
 * Format a number as currency (dollars)
 *
 * @param {number} n - Amount
 * @returns {string} Formatted string (e.g., "$50,000")
 */
export function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

/**
 * Format a number as currency in thousands (K)
 *
 * @param {number} n - Amount
 * @returns {string} Formatted string (e.g., "$50K")
 */
export function fmtK(n) {
  return '$' + (n / 1000).toFixed(0) + 'K';
}

/**
 * Format a decimal as percentage
 *
 * @param {number} n - Decimal (e.g., 0.25 for 25%)
 * @returns {string} Formatted string (e.g., "25.0%")
 */
export function pct(n) {
  return (n * 100).toFixed(1) + '%';
}
