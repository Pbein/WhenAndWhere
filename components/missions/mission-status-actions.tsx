"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { TerminateMissionDialog } from "./terminate-mission-dialog";

interface MissionStatusActionsProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
}

export function MissionStatusActions({ mission }: MissionStatusActionsProps) {
  const pauseMission = useMutation(api.missions.pause);
  const resumeMission = useMutation(api.missions.resume);
  const [showTerminate, setShowTerminate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePause = async () => {
    setIsUpdating(true);
    try {
      await pauseMission({ id: mission._id });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResume = async () => {
    setIsUpdating(true);
    try {
      await resumeMission({ id: mission._id });
    } finally {
      setIsUpdating(false);
    }
  };

  if (mission.status === "TERMINATED") {
    return null;
  }

  return (
    <div className="flex gap-2">
      {mission.status === "ACTIVE" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          disabled={isUpdating}
        >
          Pause
        </Button>
      )}

      {mission.status === "PAUSED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResume}
          disabled={isUpdating}
        >
          Resume
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="text-red-500"
        onClick={() => setShowTerminate(true)}
      >
        Terminate
      </Button>

      <TerminateMissionDialog
        mission={mission}
        open={showTerminate}
        onOpenChange={setShowTerminate}
      />
    </div>
  );
}
