/**
 * Application-wide constants
 */

export const COVERAGE_COLORS = {
  green: {
    bg: "#10b981",
    bgSubtle: "rgba(16, 185, 129, 0.12)",
    border: "#059669",
    text: "#10b981",
  },
  yellow: {
    bg: "#f59e0b",
    bgSubtle: "rgba(245, 158, 11, 0.12)",
    border: "#d97706",
    text: "#f59e0b",
  },
  red: {
    bg: "#ef4444",
    bgSubtle: "rgba(239, 68, 68, 0.12)",
    border: "#dc2626",
    text: "#ef4444",
  },
} as const;

export const SHIFT_COLORS = {
  day: {
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    text: "#f59e0b",
  },
  night: {
    bg: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.3)",
    text: "#818cf8",
  },
} as const;

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_HOUR = 60 * 60 * 1000;
