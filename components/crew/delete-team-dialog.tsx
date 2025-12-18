"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface DeleteTeamDialogProps {
  teamId: Id<"teams">;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTeamDialog({
  teamId,
  teamName,
  open,
  onOpenChange,
}: DeleteTeamDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const removeTeam = useMutation(api.teams.remove);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeTeam({ id: teamId });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !isDeleting && onOpenChange(false)}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-2">
          Delete Team
        </h2>
        <p className="text-sm text-[#a1a1aa] mb-6">
          Are you sure you want to delete <strong className="text-[#f5f5f5]">{teamName}</strong>? This
          will remove all crew memberships and cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Team"}
          </Button>
        </div>
      </div>
    </div>
  );
}

