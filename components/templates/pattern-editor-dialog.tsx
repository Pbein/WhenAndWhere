"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatternBuilder } from "./pattern-builder";
import { PatternPreview } from "./pattern-preview";
import { PRESETS, patternToJson, PresetKey } from "@/lib/template-presets";

interface PatternEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Doc<"scheduleTemplates">;
}

export function PatternEditorDialog({
  open,
  onOpenChange,
  template,
}: PatternEditorDialogProps) {
  const updateTemplate = useMutation(api.templates.update);
  const createTemplate = useMutation(api.templates.create);

  const [cycleDays, setCycleDays] = useState(template?.cycleDays ?? 14);
  const [crewCount, setCrewCount] = useState(4);
  const [patternJson, setPatternJson] = useState(template?.patternJson ?? "[]");
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleApplyPreset = (presetKey: PresetKey) => {
    const preset = PRESETS[presetKey];
    setCycleDays(preset.cycleDays);
    setPatternJson(patternToJson(preset.pattern));
  };

  const handleSave = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      await updateTemplate({
        id: template._id,
        patternJson,
        cycleDays,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-4xl mx-4">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
          {template ? `Edit Pattern: ${template.name}` : "Build Pattern"}
        </h2>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Cycle Length (days)</Label>
            <Input
              type="number"
              min={1}
              max={56}
              value={cycleDays}
              onChange={(e) => setCycleDays(parseInt(e.target.value) || 14)}
            />
          </div>
          <div className="space-y-2">
            <Label>Number of Crews</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={crewCount}
              onChange={(e) => setCrewCount(parseInt(e.target.value) || 4)}
            />
          </div>
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("panama")}
              >
                Panama
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyPreset("simple4crew")}
              >
                Simple 4-Crew
              </Button>
            </div>
          </div>
        </div>

        {/* Toggle between builder and preview */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={!showPreview ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            Builder
          </Button>
          <Button
            variant={showPreview ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
        </div>

        {/* Pattern Builder or Preview */}
        <div className="bg-[#111111] rounded-lg p-4 max-h-96 overflow-auto">
          {showPreview ? (
            <PatternPreview patternJson={patternJson} cycleDays={cycleDays} />
          ) : (
            <PatternBuilder
              cycleDays={cycleDays}
              crewCount={crewCount}
              initialPatternJson={patternJson}
              onChange={setPatternJson}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {template && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Pattern"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}



