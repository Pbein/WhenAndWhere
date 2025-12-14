"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Doc<"scheduleTemplates">;
  initialValues?: {
    name: string;
    description: string;
    cycleDays: number;
    shiftLengthHours: number;
    patternJson: string;
  };
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  initialValues,
}: TemplateFormDialogProps) {
  const createTemplate = useMutation(api.templates.create);
  const updateTemplate = useMutation(api.templates.update);

  const [form, setForm] = useState({
    name: template?.name ?? initialValues?.name ?? "",
    description: template?.description ?? initialValues?.description ?? "",
    cycleDays: template?.cycleDays ?? initialValues?.cycleDays ?? 14,
    shiftLengthHours: template?.shiftLengthHours ?? initialValues?.shiftLengthHours ?? 12,
    patternJson: template?.patternJson ?? initialValues?.patternJson ?? "[]",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (template) {
        await updateTemplate({
          id: template._id,
          name: form.name,
          description: form.description,
          cycleDays: form.cycleDays,
          shiftLengthHours: form.shiftLengthHours,
          patternJson: form.patternJson,
        });
      } else {
        await createTemplate({
          name: form.name,
          description: form.description,
          cycleDays: form.cycleDays,
          shiftLengthHours: form.shiftLengthHours,
          patternJson: form.patternJson,
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
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
          {template ? "Edit Template" : "New Template"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Panama 2-2-3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the rotation pattern"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cycle Length (days)</Label>
              <Input
                type="number"
                min={1}
                max={56}
                value={form.cycleDays}
                onChange={(e) =>
                  setForm({ ...form, cycleDays: parseInt(e.target.value) || 14 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Shift Length (hours)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={form.shiftLengthHours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shiftLengthHours: parseInt(e.target.value) || 12,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
