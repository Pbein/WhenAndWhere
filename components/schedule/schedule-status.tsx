"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarCheck } from "lucide-react";

interface ScheduleStatusProps {
  missionId: Id<"zooMissions">;
  className?: string;
}

/**
 * Displays the current schedule generation status for a mission,
 * showing how far into the future shifts have been generated
 */
export function ScheduleStatus({ missionId, className }: ScheduleStatusProps) {
  const lastDate = useQuery(api.schedules.getLastGeneratedDate, { missionId });

  if (lastDate === undefined) {
    return (
      <div className={cn("animate-pulse h-4 w-32 bg-[#2a2a2a] rounded", className)} />
    );
  }

  if (!lastDate) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-amber-400", className)}>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>No schedule generated yet</span>
      </div>
    );
  }

  const lastGeneratedDate = new Date(lastDate);
  const daysAhead = differenceInDays(lastGeneratedDate, new Date());
  const isLow = daysAhead < 14;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        isLow ? "text-amber-400" : "text-[#a1a1aa]",
        className
      )}
    >
      <CalendarCheck className="h-3.5 w-3.5" />
      <span>
        Generated through {format(lastGeneratedDate, "MMM d")}
        <span className="ml-1 opacity-70">
          ({daysAhead > 0 ? `${daysAhead} days ahead` : "past due"})
        </span>
      </span>
    </div>
  );
}
