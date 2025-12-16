"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface TerminateMissionDialogProps {
  mission: Doc<"zooMissions">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TerminateMissionDialog({
  mission,
  open,
  onOpenChange,
}: TerminateMissionDialogProps) {
  const terminateMission = useMutation(api.missions.terminate);
  const [isTerminating, setIsTerminating] = useState(false);

  if (!open) return null;

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      await terminateMission({ id: mission._id });
      onOpenChange(false);
    } finally {
      setIsTerminating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-2">
          Terminate Mission?
        </h2>
        <p className="text-sm text-[#a1a1aa] mb-4">
          This will permanently terminate <strong>{mission.name}</strong>. 
          All future schedules will be stopped. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
            onClick={handleTerminate}
            disabled={isTerminating}
          >
            {isTerminating ? "Terminating..." : "Terminate Mission"}
          </Button>
        </div>
      </div>
    </div>
  );
}



