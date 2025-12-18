"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftDefinitionForm } from "./shift-definition-form";

interface ShiftDefinitionsCardProps {
  shiftDefs: Doc<"shiftDefinitions">[] | undefined;
  missionId: Id<"zooMissions">;
}

export function ShiftDefinitionsCard({
  shiftDefs,
  missionId,
}: ShiftDefinitionsCardProps) {
  const [editingId, setEditingId] = useState<Id<"shiftDefinitions"> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const deleteShiftDef = useMutation(api.shiftDefinitions.remove);

  const handleDelete = async (id: Id<"shiftDefinitions">) => {
    if (confirm("Delete this shift definition?")) {
      await deleteShiftDef({ id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Times</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
          + Add Shift
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {shiftDefs?.map((def) =>
          editingId === def._id ? (
            <ShiftDefinitionForm
              key={def._id}
              missionId={missionId}
              shiftDef={def}
              onSuccess={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={def._id}
              className="flex items-center justify-between p-3 rounded bg-[#111111]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#f5f5f5]">{def.label}</span>
                  <span className="text-xs text-[#a1a1aa]">
                    {def.startTime} - {def.endTime}
                  </span>
                </div>
                <div className="text-xs text-[#a1a1aa] mt-1">
                  Required: {def.minPrimary} primary, {def.minBackup} backup
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(def._id)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDelete(def._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )
        )}

        {isAdding && (
          <ShiftDefinitionForm
            missionId={missionId}
            onSuccess={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {(!shiftDefs || shiftDefs.length === 0) && !isAdding && (
          <div className="text-sm text-[#a1a1aa] py-4 text-center">
            No shift times configured. Add Day/Night shifts to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}





