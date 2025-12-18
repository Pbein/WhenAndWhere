"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoverageBadge } from "@/components/schedule/coverage-badge";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Mission = Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };

interface MissionHealthGridProps {
  missions: Mission[] | undefined;
}

/**
 * Grid display of mission health indicators with quick navigation
 */
export function MissionHealthGrid({ missions }: MissionHealthGridProps) {
  if (!missions || missions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[#a1a1aa]">
        No active missions. Create a mission to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <MissionHealthCard key={mission._id} mission={mission} />
      ))}
    </div>
  );
}

interface MissionHealthCardProps {
  mission: Mission;
}

function MissionHealthCard({ mission }: MissionHealthCardProps) {
  const health = useQuery(api.schedules.getMissionCoverageHealth, {
    missionId: mission._id,
  });

  return (
    <Link
      href={`/schedules?mission=${mission._id}`}
      className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] p-3 transition-colors hover:border-[#3a3a3a]"
    >
      <div className="flex items-center gap-3">
        <CoverageBadge status={health?.health ?? "green"} size="md" />
        <div>
          <div className="font-medium text-[#f5f5f5]">{mission.name}</div>
          <div className="text-xs text-[#a1a1aa]">
            {health?.gapCount ?? 0} gaps this week
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[#a1a1aa]" />
    </Link>
  );
}




