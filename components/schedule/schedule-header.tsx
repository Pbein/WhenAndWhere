"use client";

import { Id } from "@/convex/_generated/dataModel";
import { format, addDays, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, LayoutGrid } from "lucide-react";

export type ViewMode = "week" | "month";

interface DateRange {
  start: Date;
  end: Date;
}

interface Mission {
  _id: Id<"zooMissions">;
  name: string;
}

interface ScheduleHeaderProps {
  missions: Mission[] | undefined;
  selectedMissionId: Id<"zooMissions"> | null;
  onMissionChange: (id: Id<"zooMissions"> | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dateRange: DateRange;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onGoToToday: () => void;
  onExtendSchedule?: () => void;
  className?: string;
}

/**
 * Header component for the schedules page with mission selector,
 * date navigation, and view mode toggle
 */
export function ScheduleHeader({
  missions,
  selectedMissionId,
  onMissionChange,
  viewMode,
  onViewModeChange,
  dateRange,
  onNavigatePrev,
  onNavigateNext,
  onGoToToday,
  onExtendSchedule,
  className,
}: ScheduleHeaderProps) {
  const formatDateDisplay = () => {
    if (viewMode === "week") {
      return `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`;
    }
    return format(dateRange.start, "MMMM yyyy");
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        "p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]",
        className
      )}
    >
      {/* Left: Mission selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedMissionId ?? ""}
          onChange={(e) => onMissionChange(e.target.value ? (e.target.value as Id<"zooMissions">) : null)}
          className={cn(
            "rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2",
            "text-sm text-[#f5f5f5] min-w-[180px]",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          )}
        >
          <option value="">Select Mission</option>
          {missions?.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        {onExtendSchedule && selectedMissionId && (
          <Button variant="outline" size="sm" onClick={onExtendSchedule}>
            Extend Schedule
          </Button>
        )}
      </div>

      {/* Center: Date navigation */}
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

        <span className="min-w-[160px] text-center text-sm font-medium text-[#f5f5f5]">
          {formatDateDisplay()}
        </span>
      </div>

      {/* Right: View toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-[#2a2a2a] overflow-hidden">
          <button
            onClick={() => onViewModeChange("week")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors",
              viewMode === "week"
                ? "bg-emerald-500 text-white"
                : "bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5]"
            )}
          >
            <CalendarDays className="h-4 w-4" />
            Week
          </button>
          <button
            onClick={() => onViewModeChange("month")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-[#2a2a2a]",
              viewMode === "month"
                ? "bg-emerald-500 text-white"
                : "bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
