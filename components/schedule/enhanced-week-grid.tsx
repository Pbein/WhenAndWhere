"use client";

import { useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { eachDayOfInterval, format } from "date-fns";
import { cn } from "@/lib/utils";
import { WeekGridHeader } from "./week-grid-header";
import { WeekGridRow } from "./week-grid-row";
import { CoverageStatus } from "./coverage-badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedWeekGridProps {
  missionId: Id<"zooMissions">;
  startDate: Date;
  endDate: Date;
  selectedShiftId?: Id<"shiftInstances"> | null;
  onShiftSelect: (shiftId: Id<"shiftInstances">) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onGoToToday?: () => void;
  filters?: {
    crewIds?: Id<"teams">[];
    shiftType?: "day" | "night" | "all";
    showUnassignedOnly?: boolean;
  };
  className?: string;
}

/**
 * Enhanced week grid calendar component with crew rows
 */
export function EnhancedWeekGrid({
  missionId,
  startDate,
  endDate,
  selectedShiftId,
  onShiftSelect,
  onNavigatePrev,
  onNavigateNext,
  onGoToToday,
  filters,
  className,
}: EnhancedWeekGridProps) {
  // Fetch teams for this mission
  const teams = useQuery(api.teams.listByMission, { missionId });

  // Fetch shifts for the date range
  const shifts = useQuery(api.schedules.getShiftsForDateRange, {
    missionId,
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
  });

  // Calculate dates in the range
  const dates = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  // Filter teams if specified
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (filters?.crewIds && filters.crewIds.length > 0) {
      return teams.filter((t) => filters.crewIds!.includes(t._id));
    }
    return teams;
  }, [teams, filters?.crewIds]);

  // Get shifts for a specific team
  const getTeamShifts = useCallback(
    (teamId: Id<"teams">) => {
      if (!shifts) return [];
      let teamShifts = shifts.filter((s) => s.teamId === teamId);

      // Apply shift type filter
      if (filters?.shiftType && filters.shiftType !== "all") {
        teamShifts = teamShifts.filter((s) => {
          const isNight = s.shiftDefinition?.label?.toLowerCase().includes("night");
          return filters.shiftType === "night" ? isNight : !isNight;
        });
      }

      // Apply unassigned only filter
      if (filters?.showUnassignedOnly) {
        teamShifts = teamShifts.filter((s) => {
          const primaryCount = s.assignments.filter((a) => a.role === "PRIMARY").length;
          const required = s.shiftDefinition?.minPrimary ?? 1;
          return primaryCount < required;
        });
      }

      return teamShifts;
    },
    [shifts, filters]
  );

  // Get coverage status for a shift
  const getCoverageStatus = useCallback(
    (shiftId: Id<"shiftInstances">): CoverageStatus => {
      const shift = shifts?.find((s) => s._id === shiftId);
      if (!shift) return "red";

      const primaryCount = shift.assignments.filter((a) => a.role === "PRIMARY").length;
      const backupCount = shift.assignments.filter((a) => a.role === "BACKUP").length;
      const minPrimary = shift.shiftDefinition?.minPrimary ?? 1;
      const minBackup = shift.shiftDefinition?.minBackup ?? 0;

      if (primaryCount < minPrimary) return "red";
      if (backupCount < minBackup) return "yellow";
      return "green";
    },
    [shifts]
  );

  if (!teams || !shifts) {
    return (
      <div className={cn("animate-pulse rounded-xl bg-[#111111] p-4", className)}>
        <div className="h-8 w-48 rounded bg-[#2a2a2a] mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded bg-[#2a2a2a]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden",
        className
      )}
    >
      {/* Navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#111111]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigatePrev}
            className="h-8 w-8 p-0 text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToToday}
            className="h-8 px-3 text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateNext}
            className="h-8 w-8 p-0 text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-[#f5f5f5]">
          {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <WeekGridHeader dates={dates} />

        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center text-[#a1a1aa]">
            No crews found for this mission
          </div>
        ) : (
          filteredTeams.map((team) => (
            <WeekGridRow
              key={team._id}
              team={team}
              dates={dates}
              shifts={getTeamShifts(team._id)}
              getCoverageStatus={getCoverageStatus}
              selectedShiftId={selectedShiftId}
              onShiftClick={onShiftSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
