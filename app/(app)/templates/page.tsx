"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateFormDialog } from "@/components/templates/template-form-dialog";
import { PatternEditorDialog } from "@/components/templates/pattern-editor-dialog";
import { PRESETS, patternToJson } from "@/lib/template-presets";

export default function TemplatesPage() {
  const templates = useQuery(api.templates.list);
  const missions = useQuery(api.missions.list);
  const createTemplate = useMutation(api.templates.create);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"scheduleTemplates"> | null>(null);
  const [patternEditId, setPatternEditId] = useState<Id<"scheduleTemplates"> | null>(null);
  const [presetValues, setPresetValues] = useState<{
    name: string;
    description: string;
    cycleDays: number;
    shiftLengthHours: number;
    patternJson: string;
  } | null>(null);

  // Find which missions use each template
  const templateUsage = useMemo(() => {
    const usage = new Map<string, typeof missions>();
    templates?.forEach((t) => usage.set(t._id, []));
    missions?.forEach((m) => {
      if (m.activeTemplateId) {
        const list = usage.get(m.activeTemplateId) ?? [];
        list.push(m);
        usage.set(m.activeTemplateId, list);
      }
    });
    return usage;
  }, [templates, missions]);

  const handleCreatePreset = async (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setPresetValues({
      name: preset.name,
      description: preset.description,
      cycleDays: preset.cycleDays,
      shiftLengthHours: preset.shiftLengthHours,
      patternJson: patternToJson(preset.pattern),
    });
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            Schedule Templates
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Manage rotation patterns like Panama 2-2-3
          </p>
        </div>
        <Button onClick={() => {
          setPresetValues(null);
          setIsCreating(true);
        }}>
          Create Template
        </Button>
      </div>

      {/* Preset Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start with Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleCreatePreset("panama")}
            >
              + Panama 2-2-3
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreatePreset("simple4crew")}
            >
              + Simple 4-Crew
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPresetValues(null);
                setIsCreating(true);
              }}
            >
              + Custom
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            usedBy={templateUsage.get(template._id) ?? []}
            onEdit={() => setEditingId(template._id)}
            onViewPattern={() => setPatternEditId(template._id)}
          />
        ))}
      </div>

      {(!templates || templates.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">
            No templates yet. Create one using a preset or from scratch!
          </p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        open={isCreating || !!editingId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingId(null);
            setPresetValues(null);
          }
        }}
        template={editingId ? templates?.find((t) => t._id === editingId) : undefined}
        initialValues={presetValues ?? undefined}
      />

      {/* Pattern Editor Dialog */}
      {patternEditId && (
        <PatternEditorDialog
          open={true}
          onOpenChange={() => setPatternEditId(null)}
          template={templates?.find((t) => t._id === patternEditId)}
        />
      )}
    </div>
  );
}
