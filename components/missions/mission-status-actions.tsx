"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { TerminateMissionDialog } from "./terminate-mission-dialog";
import { DeleteMissionDialog } from "./delete-mission-dialog";

interface MissionStatusActionsProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
}

export function MissionStatusActions({ mission }: MissionStatusActionsProps) {
  const pauseMission = useMutation(api.missions.pause);
  const resumeMission = useMutation(api.missions.resume);
  const reactivateMission = useMutation(api.missions.reactivate);
  const currentUser = useQuery(api.users.current);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = currentUser?.role === "Admin";

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

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      await reactivateMission({ id: mission._id });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show reactivate and delete options for terminated missions
  if (mission.status === "TERMINATED") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-500"
          onClick={handleReactivate}
          disabled={isUpdating}
        >
          {isUpdating ? "Reactivating..." : "Reactivate"}
        </Button>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={() => setShowDelete(true)}
            >
              Delete
            </Button>

            <DeleteMissionDialog
              mission={mission}
              open={showDelete}
              onOpenChange={setShowDelete}
            />
          </>
        )}
      </div>
    );
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




