"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CrewMembership {
  _id: Id<"crewMemberships">;
  teamId: Id<"teams">;
  isPrimary: boolean;
  team: Doc<"teams"> | null;
  mission: Doc<"zooMissions"> | null;
}

interface CrewMembershipsListProps {
  crews: CrewMembership[] | undefined;
  userId: Id<"users">;
}

export function CrewMembershipsList({ crews, userId }: CrewMembershipsListProps) {
  const setPrimary = useMutation(api.teams.setPrimaryCrew);
  const removeMember = useMutation(api.teams.removeCrewMember);

  const handleSetPrimary = async (teamId: Id<"teams">) => {
    await setPrimary({ userId, teamId });
  };

  const handleRemove = async (teamId: Id<"teams">) => {
    if (confirm("Remove from this crew?")) {
      await removeMember({ teamId, userId });
    }
  };

  if (!crews || crews.length === 0) {
    return (
      <div className="text-sm text-[#a1a1aa] py-4 text-center">
        Not assigned to any crews
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {crews.map((membership) => (
        <div
          key={membership._id}
          className="flex items-center justify-between p-3 rounded bg-[#111111]"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: membership.team?.color ?? "#10b981" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/teams`}
                  className="font-medium text-[#f5f5f5] hover:text-emerald-400"
                >
                  {membership.team?.name ?? "Unknown Team"}
                </Link>
                {membership.isPrimary && (
                  <Badge tone="green" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="text-xs text-[#a1a1aa]">
                {membership.mission?.name ?? "Unknown Mission"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!membership.isPrimary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetPrimary(membership.teamId)}
              >
                Set Primary
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => handleRemove(membership.teamId)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}




