"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CrewCard } from "@/components/crew/crew-card";
import { CreateTeamDialog } from "@/components/crew/create-team-dialog";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const missionIdParam = searchParams.get("mission");
  const missionId = missionIdParam as Id<"zooMissions"> | null;

  // Fetch mission details if filtering by mission
  const mission = useQuery(
    api.missions.get,
    missionId ? { id: missionId } : "skip"
  );

  // Fetch template requirements if mission has a template
  const templateRequirements = useQuery(
    api.templates.getTemplateRequirements,
    mission?.activeTemplateId ? { templateId: mission.activeTemplateId } : "skip"
  );

  // Fetch teams - either filtered by mission or all teams
  const teamsForMission = useQuery(
    api.teams.listByMissionWithCounts,
    missionId ? { missionId } : "skip"
  );
  const allTeams = useQuery(api.teams.list, missionId ? "skip" : {});
  const allMissions = useQuery(api.missions.list);

  const teams = missionId ? teamsForMission : allTeams;
  
  // Calculate crew requirements
  const crewCount = teams?.length ?? 0;
  const requiredCount = templateRequirements?.requiredCrewCount ?? 0;
  const hasTemplate = mission?.activeTemplateId && requiredCount > 0;
  const isInsufficient = hasTemplate && crewCount < requiredCount;

  const [expandedTeamId, setExpandedTeamId] = useState<Id<"teams"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {missionId && mission && (
        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
          <Link href="/missions" className="hover:text-[#f5f5f5]">
            Missions
          </Link>
          <span>/</span>
          <Link href={`/missions/${missionId}`} className="hover:text-[#f5f5f5]">
            {mission.name}
          </Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">Teams</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {missionId && mission ? `${mission.name} Teams` : "All Teams"}
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            {missionId
              ? "Manage crew teams for this mission"
              : "Manage all crew teams across missions"}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Create Team</Button>
      </div>

      {/* Requirements Banner */}
      {hasTemplate && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${
            isInsufficient
              ? "bg-red-500/10 border-red-500/30"
              : "bg-emerald-500/10 border-emerald-500/30"
          }`}
        >
          {isInsufficient ? (
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div
              className={`font-medium mb-1 ${
                isInsufficient ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {isInsufficient
                ? "Missing Crews for Schedule Template"
                : "Crew Requirements Met"}
            </div>
            <p
              className={`text-sm ${
                isInsufficient ? "text-red-300" : "text-emerald-300"
              }`}
            >
              This mission uses the <strong>{templateRequirements?.templateName}</strong>{" "}
              schedule template, which requires <strong>{requiredCount} crews</strong>.{" "}
              {isInsufficient ? (
                <>
                  You currently have <strong>{crewCount}</strong> crew
                  {crewCount !== 1 ? "s" : ""} assigned. Create{" "}
                  <strong>{requiredCount - crewCount}</strong> more crew
                  {requiredCount - crewCount !== 1 ? "s" : ""} to meet the requirement.
                </>
              ) : (
                <>
                  You have <strong>{crewCount}</strong> crew{crewCount !== 1 ? "s" : ""}{" "}
                  assigned, which meets the schedule requirements.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Teams List */}
      <div className="space-y-4">
        {teams?.map((team) => (
          <CrewCard
            key={team._id}
            team={team}
            mission={
              missionId
                ? mission ?? undefined
                : allMissions?.find((m) => m._id === team.missionId)
            }
            isExpanded={expandedTeamId === team._id}
            onToggle={() =>
              setExpandedTeamId(expandedTeamId === team._id ? null : team._id)
            }
          />
        ))}
      </div>

      {/* Empty State */}
      {(!teams || teams.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">
            {missionId
              ? "No teams for this mission yet. Create one to get started!"
              : "No teams yet. Create one to get started!"}
          </p>
        </div>
      )}

      {/* Loading State */}
      {teams === undefined && (
        <div className="flex items-center justify-center h-32">
          <div className="text-[#a1a1aa]">Loading teams...</div>
        </div>
      )}

      <CreateTeamDialog open={isCreating} onOpenChange={setIsCreating} />
    </div>
  );
}
