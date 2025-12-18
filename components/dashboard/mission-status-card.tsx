"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoverageBadge } from "@/components/schedule/coverage-badge";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Mission = Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };

interface MissionStatusCardProps {
  mission: Mission;
}

/**
 * Detailed mission status card for OpsLead dashboard showing health, coverage, and actions
 */
export function MissionStatusCard({ mission }: MissionStatusCardProps) {
  const health = useQuery(api.schedules.getMissionCoverageHealth, {
    missionId: mission._id,
  });
  const lastGenerated = useQuery(api.schedules.getLastGeneratedDate, {
    missionId: mission._id,
  });

  const healthColor =
    health?.health === "green"
      ? "bg-[#10b981]"
      : health?.health === "yellow"
        ? "bg-[#f59e0b]"
        : "bg-[#ef4444]";

  const statusTone =
    mission.status === "ACTIVE"
      ? "green"
      : mission.status === "PAUSED"
        ? "amber"
        : "gray";

  return (
    <Card className="relative overflow-hidden">
      {/* Health indicator stripe */}
      <div
        className={cn("absolute left-0 right-0 top-0 h-1", healthColor)}
      />

      <CardHeader className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{mission.name}</CardTitle>
            <Badge tone={statusTone} className="mt-1">
              {mission.status}
            </Badge>
          </div>
          <CoverageBadge status={health?.health ?? "green"} size="lg" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-[#a1a1aa]">
            <span>Coverage gaps (7d)</span>
            <span
              className={cn(
                health?.gapCount ? "text-[#ef4444]" : "text-[#10b981]"
              )}
            >
              {health?.gapCount ?? 0}
            </span>
          </div>
          <div className="flex justify-between text-[#a1a1aa]">
            <span>Generated through</span>
            <span>
              {lastGenerated
                ? format(new Date(lastGenerated), "MMM d")
                : "Not set"}
            </span>
          </div>
          <div className="flex justify-between text-[#a1a1aa]">
            <span>Total shifts (7d)</span>
            <span>{health?.totalShifts ?? 0}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/schedules?mission=${mission._id}`}
            className="flex-1 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-center text-xs text-[#f5f5f5] transition-colors hover:bg-[#2a2a2a]"
          >
            View Schedule
          </Link>
          <Link
            href={`/missions/${mission._id}`}
            className="flex-1 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-center text-xs text-[#f5f5f5] transition-colors hover:bg-[#2a2a2a]"
          >
            Details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}




