"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function MissionsPage() {
  const missions = useQuery(api.missions.list);
  const createMission = useMutation(api.missions.create);
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async () => {
    setIsAdding(true);
    try {
      await createMission({
        name: "New Mission",
        description: "Description here",
        status: "ACTIVE",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Missions</h1>
          <p className="text-sm text-[#a1a1aa]">Manage zoo habitats and areas</p>
        </div>
        <Button onClick={handleCreate} disabled={isAdding}>
          Add Mission
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions?.map((mission) => (
          <Card key={mission._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{mission.name}</CardTitle>
                <Badge
                  tone={
                    mission.status === "ACTIVE"
                      ? "green"
                      : mission.status === "PAUSED"
                        ? "amber"
                        : "gray"
                  }
                >
                  {mission.status === "ACTIVE"
                    ? "Active"
                    : mission.status === "PAUSED"
                      ? "Paused"
                      : "Terminated"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a1a1aa]">{mission.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!missions || missions.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">No missions yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
