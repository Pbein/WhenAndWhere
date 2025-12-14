/**
 * Shared helper functions for schedule generation and date calculations
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate which day in the rotation cycle a target date falls on.
 * Handles negative differences (dates before anchor) correctly.
 */
export function calculateCycleDay(
  anchorDate: number,
  targetDate: number,
  cycleDays: number
): number {
  const daysSinceAnchor = Math.floor((targetDate - anchorDate) / MS_PER_DAY);
  return ((daysSinceAnchor % cycleDays) + cycleDays) % cycleDays;
}

/**
 * Get the start of day (midnight) for a given timestamp in UTC
 */
export function startOfDayUTC(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get the end of day (23:59:59.999) for a given timestamp in UTC
 */
export function endOfDayUTC(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Parse time string (HH:MM) to hours and minutes
 */
export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Create a timestamp for a specific time on a given date
 */
export function createTimestamp(dateMs: number, timeString: string): number {
  const date = new Date(dateMs);
  const { hours, minutes } = parseTimeString(timeString);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.getTime();
}

/**
 * Calculate the end timestamp for a shift, handling overnight shifts
 */
export function calculateShiftEnd(
  dateMs: number,
  startTime: string,
  endTime: string
): number {
  const startParts = parseTimeString(startTime);
  const endParts = parseTimeString(endTime);
  
  let endDate = new Date(dateMs);
  endDate.setUTCHours(endParts.hours, endParts.minutes, 0, 0);
  
  // If end time is before start time, it's an overnight shift
  if (
    endParts.hours < startParts.hours ||
    (endParts.hours === startParts.hours && endParts.minutes < startParts.minutes)
  ) {
    endDate = new Date(endDate.getTime() + MS_PER_DAY);
  }
  
  return endDate.getTime();
}
