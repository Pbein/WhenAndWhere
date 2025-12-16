"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

interface CreateMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#ef4444", // red
];

export function CreateMissionDialog({
  open,
  onOpenChange,
}: CreateMissionDialogProps) {
  const createMission = useMutation(api.missions.create);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Validation
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  console.log("CreateMissionDialog render - open:", open);

  if (!open) return null;

  const handleClose = () => {
    // Reset form
    setName("");
    setDescription("");
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setColor(PRESET_COLORS[0]);
    setErrors({});
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { name?: string; description?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Mission name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsCreating(true);
    try {
      await createMission({
        name: name.trim(),
        description: description.trim(),
        timezone: timezone || undefined,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        color,
        status: "ACTIVE",
      });
      handleClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f5f5f5]">
            Create New Mission
          </h2>
          <button
            onClick={handleClose}
            className="text-[#a1a1aa] hover:text-[#f5f5f5]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mission Name */}
          <div>
            <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
              Mission Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g., Panda Habitat"
              className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#52525b]"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors({ ...errors, description: undefined });
              }}
              placeholder="Brief explanation of the mission"
              rows={3}
              className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5] placeholder:text-[#52525b]"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Timezone and Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              >
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/Phoenix">America/Phoenix</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              />
            </div>
          </div>

          {/* End Date and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              />
              <p className="text-xs text-[#71717a] mt-1">Leave empty for indefinite</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#a1a1aa] block mb-1">
                Color
              </label>
              <div className="flex gap-2 pt-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === presetColor
                        ? "border-[#f5f5f5] ring-2 ring-[#3a3a3a]"
                        : "border-[#2a2a2a]"
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Mission"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

