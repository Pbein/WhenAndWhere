"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CrewCard } from "@/components/crew/crew-card";
import { CreateTeamDialog } from "@/components/crew/create-team-dialog";

export default function CrewPage() {
  const teams = useQuery(api.teams.list);
  const missions = useQuery(api.missions.list);
  const [expandedTeamId, setExpandedTeamId] = useState<Id<"teams"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Crews</h1>
          <p className="text-sm text-[#a1a1aa]">
            Manage crew teams and members
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Create Team</Button>
      </div>

      <div className="space-y-4">
        {teams?.map((team) => (
          <CrewCard
            key={team._id}
            team={team}
            mission={missions?.find((m) => m._id === team.missionId)}
            isExpanded={expandedTeamId === team._id}
            onToggle={() =>
              setExpandedTeamId(expandedTeamId === team._id ? null : team._id)
            }
          />
        ))}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">
            No teams yet. Create one to get started!
          </p>
        </div>
      )}

      <CreateTeamDialog open={isCreating} onOpenChange={setIsCreating} />
    </div>
  );
}
