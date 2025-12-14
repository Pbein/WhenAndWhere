"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamsPage() {
  const teams = useQuery(api.teams.list);
  const missions = useQuery(api.missions.list);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Teams</h1>
        <p className="text-sm text-[#a1a1aa]">Manage crew teams and assignments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => {
          const mission = missions?.find((m) => m._id === team.missionId);
          return (
            <Card key={team._id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#a1a1aa] mb-2">{team.description}</p>
                <p className="text-xs text-[#a1a1aa]">
                  Mission: {mission?.name ?? "Unknown"}
                </p>
                {team.focus && (
                  <p className="text-xs text-[#a1a1aa]">Focus: {team.focus}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!teams || teams.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">No teams yet.</p>
        </div>
      )}
    </div>
  );
}
