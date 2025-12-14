"use client";

import { useState, useCallback, useMemo } from "react";
import {
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

export type CalendarViewMode = "week" | "month";

interface UseCalendarNavigationOptions {
  initialDate?: Date;
  initialViewMode?: CalendarViewMode;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Hook for managing calendar navigation and date range calculations
 */
export function useCalendarNavigation(options: UseCalendarNavigationOptions = {}) {
  const {
    initialDate = new Date(),
    initialViewMode = "week",
    weekStartsOn = 0,
  } = options;

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn }),
        end: endOfWeek(currentDate, { weekStartsOn }),
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    }
  }, [currentDate, viewMode, weekStartsOn]);

  // Get all days in the current view
  const days = useMemo(() => {
    return eachDayOfInterval(dateRange);
  }, [dateRange]);

  // For month view, get the full calendar grid including prev/next month days
  const calendarWeeks = useMemo(() => {
    if (viewMode !== "month") return [];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks: Date[][] = [];

    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks;
  }, [currentDate, viewMode, weekStartsOn]);

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "week") {
        return addDays(prev, -7);
      } else {
        return addMonths(prev, -1);
      }
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "week") {
        return addDays(prev, 7);
      } else {
        return addMonths(prev, 1);
      }
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Helper to check if a date is in the current month (for month view styling)
  const isInCurrentMonth = useCallback(
    (date: Date) => isSameMonth(date, currentDate),
    [currentDate]
  );

  // Helper to check if a date is today
  const checkIsToday = useCallback((date: Date) => isToday(date), []);

  // Helper to check if a date is selected
  const isSelected = useCallback(
    (date: Date, selectedDate: Date | null) =>
      selectedDate ? isSameDay(date, selectedDate) : false,
    []
  );

  return {
    currentDate,
    dateRange,
    days,
    calendarWeeks,
    viewMode,
    setViewMode,
    navigatePrev,
    navigateNext,
    goToToday,
    goToDate,
    isInCurrentMonth,
    isToday: checkIsToday,
    isSelected,
  };
}
