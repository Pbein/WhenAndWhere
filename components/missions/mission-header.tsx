"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Doc } from "@/convex/_generated/dataModel";

interface MissionHeaderProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
}

export function MissionHeader({ mission }: MissionHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {mission.name}
          </h1>
          <Badge
            tone={
              mission.status === "ACTIVE"
                ? "green"
                : mission.status === "PAUSED"
                  ? "amber"
                  : "gray"
            }
          >
            {mission.status}
          </Badge>
        </div>
        <p className="text-sm text-[#a1a1aa] mt-1">{mission.description}</p>
        {mission.timezone && (
          <p className="text-xs text-[#71717a] mt-1">
            Timezone: {mission.timezone}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Link
          href={`/schedules?mission=${mission._id}`}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition hover:bg-[#2a2a2a]"
        >
          View Schedule
        </Link>
      </div>
    </div>
  );
}
