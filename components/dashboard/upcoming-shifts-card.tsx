"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar, Clock } from "lucide-react";

interface UpcomingShiftsCardProps {
  userId: Id<"users">;
  limit?: number;
}

/**
 * Displays upcoming shifts for a user with assignment role indicators
 */
export function UpcomingShiftsCard({ userId, limit = 5 }: UpcomingShiftsCardProps) {
  const shifts = useQuery(api.schedules.getUserUpcomingShifts, {
    userId,
    limit,
  });

  if (!shifts || shifts.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#a1a1aa]">
        No upcoming shifts scheduled
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shifts.map((shift) => (
        <div
          key={shift._id}
          className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#1a1a1a]">
              <span className="text-xs text-[#a1a1aa]">
                {format(new Date(shift.dateStart), "MMM")}
              </span>
              <span className="text-sm font-semibold text-[#f5f5f5]">
                {format(new Date(shift.dateStart), "d")}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#f5f5f5]">
                  {shift.mission?.name}
                </span>
                <Badge
                  tone={shift.assignment.role === "PRIMARY" ? "green" : "gray"}
                >
                  {shift.assignment.role}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {shift.shiftDefinition?.label}
                </span>
                <span>
                  {format(new Date(shift.dateStart), "h:mm a")} -{" "}
                  {format(new Date(shift.dateEnd), "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}




