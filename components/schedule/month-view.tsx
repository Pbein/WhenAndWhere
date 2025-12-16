"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { CoverageBadge, CoverageStatus } from "./coverage-badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthViewProps {
  missionId: Id<"zooMissions">;
  month: Date;
  onDayClick: (date: Date) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onGoToToday?: () => void;
  className?: string;
}

interface DaySummary {
  date: Date;
  dayShiftStatus: CoverageStatus | null;
  nightShiftStatus: CoverageStatus | null;
  dayAssigned: number;
  dayRequired: number;
  nightAssigned: number;
  nightRequired: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Month view calendar showing coverage summary for each day
 */
export function MonthView({
  missionId,
  month,
  onDayClick,
  onNavigate,
  onGoToToday,
  className,
}: MonthViewProps) {
  // Calculate calendar grid dates
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks: Date[][] = [];

    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return {
      monthStart,
      monthEnd,
      calendarStart,
      calendarEnd,
      weeks,
    };
  }, [month]);

  // Fetch shifts for the calendar range
  const shifts = useQuery(api.schedules.getShiftsForDateRange, {
    missionId,
    startDate: calendarData.calendarStart.getTime(),
    endDate: calendarData.calendarEnd.getTime(),
  });

  // Calculate day summaries
  const daySummaries = useMemo(() => {
    if (!shifts) return new Map<string, DaySummary>();

    const summaries = new Map<string, DaySummary>();

    for (const week of calendarData.weeks) {
      for (const date of week) {
        const dateKey = format(date, "yyyy-MM-dd");
        const dayShifts = shifts.filter((s) => {
          const shiftDate = new Date(s.dateStart);
          return (
            isSameDay(shiftDate, date) &&
            !s.shiftDefinition?.label?.toLowerCase().includes("night")
          );
        });
        const nightShifts = shifts.filter((s) => {
          const shiftDate = new Date(s.dateStart);
          return (
            isSameDay(shiftDate, date) &&
            s.shiftDefinition?.label?.toLowerCase().includes("night")
          );
        });

        // Calculate day shift coverage
        let dayAssigned = 0;
        let dayRequired = 0;
        for (const shift of dayShifts) {
          dayAssigned += shift.assignments.filter((a) => a.role === "PRIMARY").length;
          dayRequired += shift.shiftDefinition?.minPrimary ?? 1;
        }

        // Calculate night shift coverage
        let nightAssigned = 0;
        let nightRequired = 0;
        for (const shift of nightShifts) {
          nightAssigned += shift.assignments.filter((a) => a.role === "PRIMARY").length;
          nightRequired += shift.shiftDefinition?.minPrimary ?? 1;
        }

        // Determine coverage status
        const getDayStatus = (): CoverageStatus | null => {
          if (dayShifts.length === 0) return null;
          if (dayAssigned < dayRequired) return "red";
          return "green";
        };

        const getNightStatus = (): CoverageStatus | null => {
          if (nightShifts.length === 0) return null;
          if (nightAssigned < nightRequired) return "red";
          return "green";
        };

        summaries.set(dateKey, {
          date,
          dayShiftStatus: getDayStatus(),
          nightShiftStatus: getNightStatus(),
          dayAssigned,
          dayRequired,
          nightAssigned,
          nightRequired,
        });
      }
    }

    return summaries;
  }, [shifts, calendarData.weeks]);

  if (!shifts) {
    return (
      <div className={cn("animate-pulse rounded-xl bg-[#111111] p-4", className)}>
        <div className="h-8 w-48 rounded bg-[#2a2a2a] mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[#2a2a2a]" />
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
            onClick={() => onNavigate("prev")}
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
            onClick={() => onNavigate("next")}
            className="h-8 w-8 p-0 text-[#a1a1aa] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-[#f5f5f5]">
          {format(month, "MMMM yyyy")}
        </div>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 border-b border-[#2a2a2a] bg-[#111111]">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-[#a1a1aa]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="p-1">
        {calendarData.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date) => {
              const dateKey = format(date, "yyyy-MM-dd");
              const summary = daySummaries.get(dateKey);
              const inCurrentMonth = isSameMonth(date, month);
              const today = isToday(date);

              return (
                <button
                  key={dateKey}
                  onClick={() => onDayClick(date)}
                  className={cn(
                    "p-2 rounded-lg text-left transition-colors min-h-[80px]",
                    "hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-emerald-500",
                    !inCurrentMonth && "opacity-40",
                    today && "bg-emerald-500/10 border border-emerald-500/30"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      today ? "text-emerald-400" : "text-[#f5f5f5]"
                    )}
                  >
                    {date.getDate()}
                  </div>

                  {summary && (
                    <div className="space-y-1">
                      {summary.dayShiftStatus && (
                        <div className="flex items-center gap-1.5">
                          <CoverageBadge status={summary.dayShiftStatus} size="sm" />
                          <span className="text-xs text-[#a1a1aa]">
                            D: {summary.dayAssigned}/{summary.dayRequired}
                          </span>
                        </div>
                      )}
                      {summary.nightShiftStatus && (
                        <div className="flex items-center gap-1.5">
                          <CoverageBadge status={summary.nightShiftStatus} size="sm" />
                          <span className="text-xs text-[#a1a1aa]">
                            N: {summary.nightAssigned}/{summary.nightRequired}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}



