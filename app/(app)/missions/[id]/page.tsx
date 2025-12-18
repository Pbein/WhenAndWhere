"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MissionHeader } from "@/components/missions/mission-header";
import { MissionLifecycleCard } from "@/components/missions/mission-lifecycle-card";
import { CrewsCard } from "@/components/missions/crews-card";
import { ShiftDefinitionsCard } from "@/components/missions/shift-definitions-card";
import { QuickActionsCard } from "@/components/missions/quick-actions-card";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MissionDetailPage({ params }: Props) {
  const { id } = use(params);
  const missionId = id as Id<"zooMissions">;

  const mission = useQuery(api.missions.get, { id: missionId });
  const crews = useQuery(api.teams.listByMissionWithCounts, { missionId });
  const shiftDefs = useQuery(api.shiftDefinitions.listByMission, { missionId });

  if (mission === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#a1a1aa]">Loading...</div>
      </div>
    );
  }

  if (mission === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-[#a1a1aa]">Mission not found</div>
        <Link href="/missions" className="text-emerald-500 hover:underline">
          Back to Missions
        </Link>
      </div>
    );
  }

  // Normalize status for the mission
  const missionWithStatus = {
    ...mission,
    status: (mission.status ?? "ACTIVE") as "ACTIVE" | "PAUSED" | "TERMINATED",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
        <Link href="/missions" className="hover:text-[#f5f5f5]">
          Missions
        </Link>
        <span>/</span>
        <span className="text-[#f5f5f5]">{mission.name}</span>
      </div>

      {/* Header */}
      <MissionHeader mission={missionWithStatus} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Card - spans 2 columns on large screens */}
        <MissionLifecycleCard mission={missionWithStatus} />

        {/* Crews Card */}
        <CrewsCard 
          crews={crews} 
          missionId={missionId} 
          templateId={mission.activeTemplateId ?? null}
        />

        {/* Shift Definitions Card */}
        <ShiftDefinitionsCard shiftDefs={shiftDefs} missionId={missionId} />

        {/* Quick Actions Card */}
        <QuickActionsCard mission={missionWithStatus} />
      </div>
    </div>
  );
}





