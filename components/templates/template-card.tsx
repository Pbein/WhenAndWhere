"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TemplateCardProps {
  template: Doc<"scheduleTemplates">;
  usedBy: Doc<"zooMissions">[];
  onEdit: () => void;
  onViewPattern: () => void;
}

export function TemplateCard({
  template,
  usedBy,
  onEdit,
  onViewPattern,
}: TemplateCardProps) {
  const deleteTemplate = useMutation(api.templates.remove);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    await deleteTemplate({ id: template._id });
    setShowDelete(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => setShowDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#a1a1aa] mb-3">{template.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-[#a1a1aa] mb-3">
          <div>Shift Length: {template.shiftLengthHours}h</div>
          <div>Cycle: {template.cycleDays} days</div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mb-3"
          onClick={onViewPattern}
        >
          View Pattern
        </Button>

        {usedBy.length > 0 && (
          <div className="pt-3 border-t border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa] mb-1">Used by:</div>
            <div className="flex gap-1 flex-wrap">
              {usedBy.map((m) => (
                <Badge key={m._id} tone="blue" className="text-xs">
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDelete(false)}
          />
          <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-2">
              Delete Template?
            </h2>
            <p className="text-sm text-[#a1a1aa] mb-4">
              {usedBy.length > 0
                ? `This template is used by ${usedBy.length} mission(s). Deleting it may affect their schedules.`
                : "This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}



