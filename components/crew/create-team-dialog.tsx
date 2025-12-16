"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const missions = useQuery(api.missions.listActive);
  const createTeam = useMutation(api.teams.create);

  const [form, setForm] = useState({
    name: "",
    missionId: "",
    description: "",
    focus: "",
    shiftPreference: "BOTH" as "DAY" | "NIGHT" | "BOTH",
    color: "#10b981",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.missionId) return;

    setIsCreating(true);
    try {
      await createTeam({
        name: form.name,
        missionId: form.missionId as Id<"zooMissions">,
        description: form.description,
        focus: form.focus || undefined,
        shiftPreference: form.shiftPreference,
        color: form.color,
      });
      onOpenChange(false);
      setForm({
        name: "",
        missionId: "",
        description: "",
        focus: "",
        shiftPreference: "BOTH",
        color: "#10b981",
      });
    } finally {
      setIsCreating(false);
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
          Create New Team
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Crew A, Alpha Team"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <select
              id="mission"
              value={form.missionId}
              onChange={(e) => setForm({ ...form, missionId: e.target.value })}
              className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              required
            >
              <option value="">Select a mission...</option>
              {missions?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the team"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="focus">Focus (optional)</Label>
              <Input
                id="focus"
                value={form.focus}
                onChange={(e) => setForm({ ...form, focus: e.target.value })}
                placeholder="e.g., Training, Operations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Shift Preference</Label>
              <select
                id="shift"
                value={form.shiftPreference}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shiftPreference: e.target.value as "DAY" | "NIGHT" | "BOTH",
                  })
                }
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Team Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-20 rounded border border-[#2a2a2a] bg-transparent cursor-pointer"
              />
              <Input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="flex-1"
                placeholder="#10b981"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



