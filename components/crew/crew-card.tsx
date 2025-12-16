"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrewMemberRow } from "./crew-member-row";
import { AddMemberDialog } from "./add-member-dialog";

interface CrewCardProps {
  team: Doc<"teams">;
  mission: Doc<"zooMissions"> | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CrewCard({ team, mission, isExpanded, onToggle }: CrewCardProps) {
  const members = useQuery(api.teams.getCrewMembers, { teamId: team._id });
  const [isAddingMember, setIsAddingMember] = useState(false);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: team.color ?? "#10b981" }}
          />
          <CardTitle>{team.name}</CardTitle>
          <Badge tone="blue">{members?.length ?? 0} members</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#a1a1aa]">{mission?.name}</span>
          <span className="text-[#a1a1aa] text-lg">
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {members?.map((member) => (
              <CrewMemberRow
                key={member._id}
                membership={member}
                teamId={team._id}
              />
            ))}

            {(!members || members.length === 0) && (
              <div className="text-sm text-[#a1a1aa] py-4 text-center">
                No members yet
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingMember(true);
              }}
            >
              + Add Member
            </Button>
          </div>

          <AddMemberDialog
            teamId={team._id}
            existingMemberIds={members?.map((m) => m.userId) ?? []}
            open={isAddingMember}
            onOpenChange={setIsAddingMember}
          />
        </CardContent>
      )}
    </Card>
  );
}



