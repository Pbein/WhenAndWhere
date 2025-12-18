"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
} from "date-fns";

import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { ScheduleStatus } from "@/components/schedule/schedule-status";
import { ExtendScheduleModal } from "@/components/schedule/extend-schedule-modal";
import { FilterBar, ScheduleFilters, DEFAULT_FILTERS } from "@/components/schedule/filter-bar";
import { EnhancedWeekGrid } from "@/components/schedule/enhanced-week-grid";
import { MonthView } from "@/components/schedule/month-view";
import { SlotPanel } from "@/components/schedule/slot-panel";

type ViewMode = "week" | "month";

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Main schedules page providing calendar views for managing shift assignments.
 * Supports week and month views with filtering and slot assignment panel.
 */
export default function SchedulesPage() {
  // Read mission from URL query params
  const searchParams = useSearchParams();
  const missionParam = searchParams.get("mission");
  
  // Mission selection - initialize from URL param if present
  const [selectedMissionId, setSelectedMissionId] = useState<Id<"zooMissions"> | null>(null);
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  }));
  
  // Shift selection for panel
  const [selectedShiftId, setSelectedShiftId] = useState<Id<"shiftInstances"> | null>(null);
  
  // Modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<ScheduleFilters>(DEFAULT_FILTERS);

  // Fetch data
  const missions = useQuery(api.missions.listActive);
  
  // Set mission from URL param on initial load
  useEffect(() => {
    if (missionParam && !hasInitializedFromUrl) {
      setSelectedMissionId(missionParam as Id<"zooMissions">);
      setHasInitializedFromUrl(true);
    }
  }, [missionParam, hasInitializedFromUrl]);
  const teams = useQuery(
    api.teams.listByMission,
    selectedMissionId ? { missionId: selectedMissionId } : "skip"
  );

  // Clear shift selection when mission changes
  useEffect(() => {
    setSelectedShiftId(null);
  }, [selectedMissionId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close panel
      if (e.key === "Escape" && selectedShiftId) {
        setSelectedShiftId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedShiftId]);

  // Navigation handlers
  const navigatePrev = useCallback(() => {
    setDateRange((prev) => {
      if (viewMode === "week") {
        return {
          start: addDays(prev.start, -7),
          end: addDays(prev.end, -7),
        };
      } else {
        const newStart = addMonths(prev.start, -1);
        return {
          start: startOfMonth(newStart),
          end: endOfMonth(newStart),
        };
      }
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setDateRange((prev) => {
      if (viewMode === "week") {
        return {
          start: addDays(prev.start, 7),
          end: addDays(prev.end, 7),
        };
      } else {
        const newStart = addMonths(prev.start, 1);
        return {
          start: startOfMonth(newStart),
          end: endOfMonth(newStart),
        };
      }
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
      setDateRange({
        start: startOfMonth(now),
        end: endOfMonth(now),
      });
    }
  }, [viewMode]);

  // Handle view mode change and adjust date range
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    const currentDate = dateRange.start;
    
    if (mode === "week") {
      setDateRange({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      });
    } else {
      setDateRange({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      });
    }
  }, [dateRange.start]);

  // Handle clicking a day in month view to switch to week view
  const handleMonthDayClick = useCallback((date: Date) => {
    setViewMode("week");
    setDateRange({
      start: startOfWeek(date, { weekStartsOn: 0 }),
      end: endOfWeek(date, { weekStartsOn: 0 }),
    });
  }, []);

  // Handle month navigation from MonthView component
  const handleMonthNavigate = useCallback((direction: "prev" | "next") => {
    setDateRange((prev) => {
      const newStart = addMonths(prev.start, direction === "prev" ? -1 : 1);
      return {
        start: startOfMonth(newStart),
        end: endOfMonth(newStart),
      };
    });
  }, []);

  // Filters passed to grid components
  const gridFilters = useMemo(() => ({
    crewIds: filters.crewIds.length > 0 ? filters.crewIds : undefined,
    shiftType: filters.shiftType,
    showUnassignedOnly: filters.showUnassignedOnly,
  }), [filters]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <ScheduleHeader
        missions={missions}
        selectedMissionId={selectedMissionId}
        onMissionChange={setSelectedMissionId}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        dateRange={dateRange}
        onNavigatePrev={navigatePrev}
        onNavigateNext={navigateNext}
        onGoToToday={goToToday}
        onExtendSchedule={selectedMissionId ? () => setShowExtendModal(true) : undefined}
      />

      {/* Schedule status and filters */}
      {selectedMissionId && (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#0a0a0a]">
            <ScheduleStatus missionId={selectedMissionId} />
          </div>
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            crews={teams}
          />
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar view */}
        <div className="flex-1 overflow-auto p-4">
          {!selectedMissionId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg font-medium text-[#f5f5f5] mb-2">
                  Select a Mission
                </div>
                <p className="text-sm text-[#a1a1aa]">
                  Choose a mission from the dropdown above to view and manage schedules.
                </p>
              </div>
            </div>
          ) : viewMode === "week" ? (
            <EnhancedWeekGrid
              missionId={selectedMissionId}
              startDate={dateRange.start}
              endDate={dateRange.end}
              selectedShiftId={selectedShiftId}
              onShiftSelect={setSelectedShiftId}
              onNavigatePrev={navigatePrev}
              onNavigateNext={navigateNext}
              onGoToToday={goToToday}
              filters={gridFilters}
              className="h-full"
            />
          ) : (
            <MonthView
              missionId={selectedMissionId}
              month={dateRange.start}
              onDayClick={handleMonthDayClick}
              onNavigate={handleMonthNavigate}
              onGoToToday={goToToday}
              className="h-full"
            />
          )}
        </div>

        {/* Slot panel */}
        <SlotPanel
          shiftId={selectedShiftId}
          isOpen={!!selectedShiftId}
          onClose={() => setSelectedShiftId(null)}
        />
      </div>

      {/* Extend schedule modal */}
      {selectedMissionId && (
        <ExtendScheduleModal
          missionId={selectedMissionId}
          isOpen={showExtendModal}
          onClose={() => setShowExtendModal(false)}
          onSuccess={(newEndDate) => {
            // Optionally navigate to show the new end date
            if (viewMode === "week") {
              setDateRange({
                start: startOfWeek(newEndDate, { weekStartsOn: 0 }),
                end: endOfWeek(newEndDate, { weekStartsOn: 0 }),
              });
            }
          }}
        />
      )}
    </div>
  );
}
