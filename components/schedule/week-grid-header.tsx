"use client";

import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface WeekGridHeaderProps {
  dates: Date[];
  className?: string;
}

/**
 * Header row for week grid with date labels
 */
export function WeekGridHeader({ dates, className }: WeekGridHeaderProps) {
  return (
    <div
      className={cn(
        "grid border-b border-[#2a2a2a] bg-[#111111]",
        className
      )}
      style={{
        gridTemplateColumns: `160px repeat(${dates.length}, minmax(100px, 1fr))`,
      }}
    >
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
        Crew
      </div>
      {dates.map((date) => (
        <div
          key={date.toISOString()}
          className={cn(
            "px-2 py-2 text-center border-l border-[#2a2a2a]",
            isToday(date) && "bg-emerald-500/10"
          )}
        >
          <div
            className={cn(
              "text-xs font-medium",
              isToday(date) ? "text-emerald-400" : "text-[#f5f5f5]"
            )}
          >
            {format(date, "EEE")}
          </div>
          <div
            className={cn(
              "text-xs",
              isToday(date) ? "text-emerald-400" : "text-[#a1a1aa]"
            )}
          >
            {format(date, "MMM d")}
          </div>
        </div>
      ))}
    </div>
  );
}



