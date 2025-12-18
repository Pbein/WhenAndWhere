"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddMemberDialogProps {
  teamId: Id<"teams">;
  existingMemberIds: Id<"users">[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({
  teamId,
  existingMemberIds,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const allUsers = useQuery(api.users.list);
  const addMember = useMutation(api.teams.addCrewMember);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(
      (u) =>
        !existingMemberIds.includes(u._id) &&
        (u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allUsers, existingMemberIds, search]);

  const handleAdd = async (userId: Id<"users">) => {
    setIsAdding(userId);
    try {
      await addMember({ teamId, userId });
      onOpenChange(false);
      setSearch("");
    } finally {
      setIsAdding(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
          Add Team Member
        </h2>

        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {availableUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => handleAdd(user._id)}
              disabled={isAdding !== null}
              className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#2a2a2a] text-left disabled:opacity-50"
            >
              <div className="h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm font-medium text-[#f5f5f5]">
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">
                  {user.name ?? "Unknown"}
                </div>
                <div className="text-xs text-[#a1a1aa]">{user.email}</div>
              </div>
              {isAdding === user._id && (
                <span className="ml-auto text-xs text-[#a1a1aa]">Adding...</span>
              )}
            </button>
          ))}
          {availableUsers.length === 0 && (
            <div className="text-sm text-[#a1a1aa] text-center py-4">
              {search ? "No matching employees" : "All employees are already members"}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-[#2a2a2a]">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}




