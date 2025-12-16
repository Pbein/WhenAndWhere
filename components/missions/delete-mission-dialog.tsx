"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface DeleteMissionDialogProps {
  mission: Doc<"zooMissions">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteMissionDialog({
  mission,
  open,
  onOpenChange,
}: DeleteMissionDialogProps) {
  const deleteMission = useMutation(api.missions.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const router = useRouter();

  if (!open) return null;

  const handleDelete = async () => {
    if (confirmName !== mission.name) return;
    
    setIsDeleting(true);
    try {
      await deleteMission({ id: mission._id });
      onOpenChange(false);
      router.push("/missions");
    } finally {
      setIsDeleting(false);
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
          Delete Mission Permanently?
        </h2>
        <p className="text-sm text-[#a1a1aa] mb-4">
          This will <strong className="text-red-400">permanently delete</strong>{" "}
          <strong>{mission.name}</strong> and all associated data. This action{" "}
          <strong className="text-red-400">cannot be undone</strong>.
        </p>
        <div className="mb-4">
          <label className="text-xs text-[#a1a1aa] block mb-1">
            Type <strong className="text-[#f5f5f5]">{mission.name}</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={mission.name}
            className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#52525b]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-red-500 border-red-500/50 hover:bg-red-500/10"
            onClick={handleDelete}
            disabled={isDeleting || confirmName !== mission.name}
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}


