"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface CrewMemberRowProps {
  membership: {
    _id: Id<"crewMemberships">;
    userId: Id<"users">;
    isPrimary: boolean;
    user: {
      _id: Id<"users">;
      name?: string;
      email: string;
    } | null;
    qualifications: Array<{
      status: string;
      qualification: { name: string } | null;
    }>;
  };
  teamId: Id<"teams">;
}

export function CrewMemberRow({ membership, teamId }: CrewMemberRowProps) {
  const removeMember = useMutation(api.teams.removeCrewMember);
  const setPrimary = useMutation(api.teams.setPrimaryCrew);

  const handleRemove = async () => {
    if (confirm("Remove this member from the crew?")) {
      await removeMember({ teamId, userId: membership.userId });
    }
  };

  const handleSetPrimary = async () => {
    await setPrimary({ userId: membership.userId, teamId });
  };

  if (!membership.user) return null;

  return (
    <div className="flex items-center justify-between p-2 rounded bg-[#0a0a0a] hover:bg-[#111111] transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-medium text-[#f5f5f5]">
          {membership.user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/crew/${membership.userId}`}
              className="font-medium text-[#f5f5f5] hover:text-emerald-400"
            >
              {membership.user.name ?? membership.user.email}
            </Link>
            {membership.isPrimary && (
              <Badge tone="green" className="text-xs">
                Primary
              </Badge>
            )}
          </div>
          <div className="flex gap-1 mt-0.5">
            {membership.qualifications.slice(0, 3).map((q, idx) => (
              <Badge
                key={idx}
                tone={q.status === "ACTIVE" ? "blue" : "amber"}
                className="text-xs"
              >
                {q.qualification?.name ?? "Unknown"}
              </Badge>
            ))}
            {membership.qualifications.length > 3 && (
              <span className="text-xs text-[#a1a1aa]">
                +{membership.qualifications.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!membership.isPrimary && (
          <Button variant="ghost" size="sm" onClick={handleSetPrimary}>
            Set Primary
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500"
          onClick={handleRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}



