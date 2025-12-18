"use client";

import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ShiftCell, EmptyShiftCell } from "./shift-cell";
import { CoverageStatus } from "./coverage-badge";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface ShiftData {
  _id: Id<"shiftInstances">;
  dateStart: number;
  status: string;
  assignments: Array<{
    _id: Id<"shiftAssignments">;
    role: "PRIMARY" | "BACKUP" | "ON_CALL";
    user: Doc<"users"> | null;
  }>;
  shiftDefinition: Doc<"shiftDefinitions"> | null;
  team: Doc<"teams"> | null;
}

interface WeekGridRowProps {
  team: Doc<"teams">;
  dates: Date[];
  shifts: ShiftData[];
  getCoverageStatus: (shiftId: Id<"shiftInstances">) => CoverageStatus;
  selectedShiftId?: Id<"shiftInstances"> | null;
  onShiftClick: (shiftId: Id<"shiftInstances">) => void;
  className?: string;
}

/**
 * Single row in the week grid representing one crew's shifts
 */
export function WeekGridRow({
  team,
  dates,
  shifts,
  getCoverageStatus,
  selectedShiftId,
  onShiftClick,
  className,
}: WeekGridRowProps) {
  // Group shifts by shift type (day/night) for each date
  const getShiftsForDate = (date: Date, shiftType: "day" | "night") => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.dateStart);
      const isDay = !shift.shiftDefinition?.label?.toLowerCase().includes("night");
      return (
        isSameDay(shiftDate, date) &&
        (shiftType === "day" ? isDay : !isDay)
      );
    });
  };

  // Check if this crew has any night shifts defined
  const hasNightShifts = shifts.some((shift) =>
    shift.shiftDefinition?.label?.toLowerCase().includes("night")
  );

  return (
    <div className={cn("border-b border-[#2a2a2a]", className)}>
      {/* Day shifts row */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `160px repeat(${dates.length}, minmax(100px, 1fr))`,
        }}
      >
        <div className="px-3 py-2 border-r border-[#2a2a2a] bg-[#0a0a0a]">
          <div
            className="text-sm font-semibold text-[#f5f5f5]"
            style={{ color: team.color || undefined }}
          >
            {team.name}
          </div>
          <div className="text-xs text-[#a1a1aa]">Day</div>
        </div>
        {dates.map((date) => {
          const dayShifts = getShiftsForDate(date, "day");
          return (
            <div
              key={date.toISOString() + "-day"}
              className="p-1.5 border-l border-[#2a2a2a] min-h-[70px]"
            >
              {dayShifts.length > 0 ? (
                <div className="space-y-1">
                  {dayShifts.map((shift) => (
                    <ShiftCell
                      key={shift._id}
                      shift={shift}
                      coverageStatus={getCoverageStatus(shift._id)}
                      isSelected={selectedShiftId === shift._id}
                      onClick={() => onShiftClick(shift._id)}
                      compact={dayShifts.length > 1}
                    />
                  ))}
                </div>
              ) : (
                <EmptyShiftCell />
              )}
            </div>
          );
        })}
      </div>

      {/* Night shifts row (if any exist) */}
      {hasNightShifts && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `160px repeat(${dates.length}, minmax(100px, 1fr))`,
          }}
        >
          <div className="px-3 py-2 border-r border-[#2a2a2a] bg-[#0a0a0a]">
            <div className="text-xs text-[#a1a1aa]">Night</div>
          </div>
          {dates.map((date) => {
            const nightShifts = getShiftsForDate(date, "night");
            return (
              <div
                key={date.toISOString() + "-night"}
                className="p-1.5 border-l border-[#2a2a2a] min-h-[70px]"
              >
                {nightShifts.length > 0 ? (
                  <div className="space-y-1">
                    {nightShifts.map((shift) => (
                      <ShiftCell
                        key={shift._id}
                        shift={shift}
                        coverageStatus={getCoverageStatus(shift._id)}
                        isSelected={selectedShiftId === shift._id}
                        onClick={() => onShiftClick(shift._id)}
                        compact={nightShifts.length > 1}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyShiftCell />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}




