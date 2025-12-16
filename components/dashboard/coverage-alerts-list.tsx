"use client";

import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CoverageBadge } from "@/components/schedule/coverage-badge";
import { Id, Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Mission = Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };

interface CoverageAlertsListProps {
  missions: Mission[] | undefined;
  limit?: number;
}

/**
 * Displays coverage gaps across missions for the next 7 days
 */
export function CoverageAlertsList({
  missions,
  limit = 5,
}: CoverageAlertsListProps) {
  if (!missions || missions.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[#a1a1aa]">
        No missions configured
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {missions.slice(0, limit).map((mission) => (
        <CoverageAlertRow key={mission._id} mission={mission} />
      ))}
    </div>
  );
}

interface CoverageAlertRowProps {
  mission: Mission;
}

function CoverageAlertRow({ mission }: CoverageAlertRowProps) {
  const health = useQuery(api.schedules.getMissionCoverageHealth, {
    missionId: mission._id,
  });

  // Only show if there are gaps
  if (!health || health.gapCount === 0) {
    return null;
  }

  return (
    <Link
      href={`/schedules?mission=${mission._id}`}
      className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] p-3 transition-colors hover:border-[#3a3a3a]"
    >
      <div className="flex items-center gap-3">
        <CoverageBadge status={health.health} size="md" />
        <div>
          <div className="text-sm font-medium text-[#f5f5f5]">
            {mission.name}
          </div>
          <div className="text-xs text-[#a1a1aa]">
            {health.redCount > 0 && (
              <span className="text-[#ef4444]">
                {health.redCount} uncovered
              </span>
            )}
            {health.redCount > 0 && health.yellowCount > 0 && ", "}
            {health.yellowCount > 0 && (
              <span className="text-[#f59e0b]">
                {health.yellowCount} partial
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[#a1a1aa]" />
    </Link>
  );
}



