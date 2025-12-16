"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShiftDefinitionFormProps {
  missionId: Id<"zooMissions">;
  shiftDef?: Doc<"shiftDefinitions">;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ShiftDefinitionForm({
  missionId,
  shiftDef,
  onSuccess,
  onCancel,
}: ShiftDefinitionFormProps) {
  const createShiftDef = useMutation(api.shiftDefinitions.create);
  const updateShiftDef = useMutation(api.shiftDefinitions.update);

  const [form, setForm] = useState({
    label: shiftDef?.label ?? "",
    startTime: shiftDef?.startTime ?? "07:00",
    endTime: shiftDef?.endTime ?? "19:00",
    minPrimary: shiftDef?.minPrimary ?? 2,
    minBackup: shiftDef?.minBackup ?? 1,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (shiftDef) {
        await updateShiftDef({
          id: shiftDef._id,
          label: form.label,
          startTime: form.startTime,
          endTime: form.endTime,
          minPrimary: form.minPrimary,
          minBackup: form.minBackup,
        });
      } else {
        await createShiftDef({
          missionId,
          label: form.label,
          startTime: form.startTime,
          endTime: form.endTime,
          minPrimary: form.minPrimary,
          minBackup: form.minBackup,
        });
      }
      onSuccess();
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: "day" | "night") => {
    if (preset === "day") {
      setForm({
        ...form,
        label: "Day",
        startTime: "07:00",
        endTime: "19:00",
      });
    } else {
      setForm({
        ...form,
        label: "Night",
        startTime: "19:00",
        endTime: "07:00",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-[#111111] rounded-lg">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Shift Name</Label>
        <Input
          id="label"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="e.g., Day, Night, Morning"
          required
        />
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Coverage Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minPrimary">Minimum Primary</Label>
          <Input
            id="minPrimary"
            type="number"
            min={1}
            value={form.minPrimary}
            onChange={(e) =>
              setForm({ ...form, minPrimary: parseInt(e.target.value) || 1 })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minBackup">Minimum Backup</Label>
          <Input
            id="minBackup"
            type="number"
            min={0}
            value={form.minBackup}
            onChange={(e) =>
              setForm({ ...form, minBackup: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
      </div>

      {/* Presets */}
      {!shiftDef && (
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset("day")}
            >
              Day (7am-7pm)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset("night")}
            >
              Night (7pm-7am)
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : shiftDef ? "Update" : "Create"} Shift
        </Button>
      </div>
    </form>
  );
}



