"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QualificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualification?: Doc<"qualifications">;
  missions?: Doc<"zooMissions">[];
}

export function QualificationFormDialog({
  open,
  onOpenChange,
  qualification,
  missions,
}: QualificationFormDialogProps) {
  const createQual = useMutation(api.qualifications.create);
  const updateQual = useMutation(api.qualifications.update);

  const [form, setForm] = useState({
    name: qualification?.name ?? "",
    description: qualification?.description ?? "",
    missionId: qualification?.missionId ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (qualification) {
        await updateQual({
          id: qualification._id,
          name: form.name,
          description: form.description,
        });
      } else {
        await createQual({
          name: form.name,
          description: form.description,
          missionId: form.missionId
            ? (form.missionId as Id<"zooMissions">)
            : undefined,
        });
      }
      onOpenChange(false);
    } finally {
      setIsSaving(false);
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
          {qualification ? "Edit Qualification" : "New Qualification"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Panda-certified, First Aid"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this qualification means"
              required
            />
          </div>

          {!qualification && (
            <div className="space-y-2">
              <Label htmlFor="mission">Mission (optional)</Label>
              <select
                id="mission"
                value={form.missionId}
                onChange={(e) => setForm({ ...form, missionId: e.target.value })}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              >
                <option value="">Global (all missions)</option>
                {missions?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#a1a1aa]">
                Mission-specific qualifications only appear for that mission
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : qualification ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}




