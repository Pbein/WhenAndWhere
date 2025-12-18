"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface ShiftWithDetails {
  _id: Id<"shiftInstances">;
  dateStart: number;
  dateEnd: number;
  assignment: {
    role: "PRIMARY" | "BACKUP" | "ON_CALL";
  };
  shiftDefinition: {
    label: string;
    startTime: string;
    endTime: string;
  } | null;
  mission: Doc<"zooMissions"> | null;
}

interface UpcomingShiftsListProps {
  shifts: ShiftWithDetails[] | undefined;
}

export function UpcomingShiftsList({ shifts }: UpcomingShiftsListProps) {
  if (!shifts || shifts.length === 0) {
    return (
      <div className="text-sm text-[#a1a1aa] py-4 text-center">
        No upcoming shifts
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-2">
      {shifts.map((shift) => (
        <div
          key={shift._id}
          className="flex items-center justify-between p-2 rounded bg-[#111111]"
        >
          <div>
            <div className="text-sm font-medium text-[#f5f5f5]">
              {formatDate(shift.dateStart)}
            </div>
            <div className="text-xs text-[#a1a1aa]">
              {shift.shiftDefinition?.label ?? "Shift"} •{" "}
              {shift.shiftDefinition?.startTime} - {shift.shiftDefinition?.endTime}
            </div>
            <div className="text-xs text-[#71717a]">
              {shift.mission?.name ?? "Unknown Mission"}
            </div>
          </div>
          <Badge
            tone={
              shift.assignment.role === "PRIMARY"
                ? "green"
                : shift.assignment.role === "BACKUP"
                  ? "blue"
                  : "amber"
            }
          >
            {shift.assignment.role}
          </Badge>
        </div>
      ))}
      <Link
        href="/schedules"
        className="block text-center text-xs text-emerald-500 hover:underline pt-2"
      >
        View full schedule →
      </Link>
    </div>
  );
}




