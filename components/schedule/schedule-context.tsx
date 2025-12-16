"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Id } from "@/convex/_generated/dataModel";
import { addDays, startOfWeek, endOfWeek } from "date-fns";

export type ViewMode = "week" | "month";

export interface ScheduleFilters {
  crewIds?: Id<"teams">[];
  shiftType?: "day" | "night" | "all";
  showUnassignedOnly?: boolean;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface ScheduleContextValue {
  // Selection state
  selectedMissionId: Id<"zooMissions"> | null;
  selectedShiftId: Id<"shiftInstances"> | null;
  
  // View state
  dateRange: DateRange;
  viewMode: ViewMode;
  filters: ScheduleFilters;
  
  // Actions
  setSelectedMission: (id: Id<"zooMissions"> | null) => void;
  setSelectedShift: (id: Id<"shiftInstances"> | null) => void;
  setDateRange: (range: DateRange) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: ScheduleFilters) => void;
  
  // Navigation
  navigatePrev: () => void;
  navigateNext: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

interface ScheduleProviderProps {
  children: ReactNode;
  initialMissionId?: Id<"zooMissions">;
}

/**
 * Provider for shared calendar/schedule state across components
 */
export function ScheduleProvider({
  children,
  initialMissionId,
}: ScheduleProviderProps) {
  const [selectedMissionId, setSelectedMissionId] = useState<Id<"zooMissions"> | null>(
    initialMissionId ?? null
  );
  const [selectedShiftId, setSelectedShiftId] = useState<Id<"shiftInstances"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [filters, setFilters] = useState<ScheduleFilters>({
    shiftType: "all",
    showUnassignedOnly: false,
  });

  // Initialize date range to current week
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };
  });

  const navigatePrev = useCallback(() => {
    setDateRange((prev) => {
      const days = viewMode === "week" ? 7 : 28;
      return {
        start: addDays(prev.start, -days),
        end: addDays(prev.end, -days),
      };
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setDateRange((prev) => {
      const days = viewMode === "week" ? 7 : 28;
      return {
        start: addDays(prev.start, days),
        end: addDays(prev.end, days),
      };
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    const now = new Date();
    if (viewMode === "week") {
      setDateRange({
        start: startOfWeek(now, { weekStartsOn: 0 }),
        end: endOfWeek(now, { weekStartsOn: 0 }),
      });
    } else {
      // For month view, adjust to show current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange({ start, end });
    }
  }, [viewMode]);

  const goToDate = useCallback(
    (date: Date) => {
      if (viewMode === "week") {
        setDateRange({
          start: startOfWeek(date, { weekStartsOn: 0 }),
          end: endOfWeek(date, { weekStartsOn: 0 }),
        });
      } else {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        setDateRange({ start, end });
      }
    },
    [viewMode]
  );

  const setSelectedMission = useCallback((id: Id<"zooMissions"> | null) => {
    setSelectedMissionId(id);
    setSelectedShiftId(null);
  }, []);

  const setSelectedShift = useCallback((id: Id<"shiftInstances"> | null) => {
    setSelectedShiftId(id);
  }, []);

  const value = useMemo<ScheduleContextValue>(
    () => ({
      selectedMissionId,
      selectedShiftId,
      dateRange,
      viewMode,
      filters,
      setSelectedMission,
      setSelectedShift,
      setDateRange,
      setViewMode,
      setFilters,
      navigatePrev,
      navigateNext,
      goToToday,
      goToDate,
    }),
    [
      selectedMissionId,
      selectedShiftId,
      dateRange,
      viewMode,
      filters,
      setSelectedMission,
      setSelectedShift,
      navigatePrev,
      navigateNext,
      goToToday,
      goToDate,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

/**
 * Hook to access schedule context
 */
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}



