"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QualificationFormDialog } from "@/components/qualifications/qualification-form-dialog";
import { QualificationsAdminList } from "@/components/qualifications/qualifications-admin-list";

export default function QualificationsAdminPage() {
  const qualifications = useQuery(api.qualifications.list, {});
  const missions = useQuery(api.missions.list);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"qualifications"> | null>(null);

  // Filter qualifications
  const globalQuals = qualifications?.filter((q) => !q.missionId);
  const missionQualGroups =
    missions?.map((mission) => ({
      mission,
      qualifications: qualifications?.filter((q) => q.missionId === mission._id),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            Qualifications
          </h1>
          <p className="text-sm text-[#a1a1aa]">
            Manage certifications and training requirements
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>Add Qualification</Button>
      </div>

      {/* Global Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle>Global Qualifications</CardTitle>
        </CardHeader>
        <CardContent>
          <QualificationsAdminList
            qualifications={globalQuals}
            onEdit={setEditingId}
          />
        </CardContent>
      </Card>

      {/* Mission-specific Qualifications */}
      {missionQualGroups.map(({ mission, qualifications: missionQuals }) => {
        if (!missionQuals || missionQuals.length === 0) return null;

        return (
          <Card key={mission._id}>
            <CardHeader>
              <CardTitle>{mission.name} Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <QualificationsAdminList
                qualifications={missionQuals}
                onEdit={setEditingId}
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Create Dialog */}
      <QualificationFormDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        missions={missions}
      />

      {/* Edit Dialog */}
      {editingId && (
        <QualificationFormDialog
          open={true}
          onOpenChange={() => setEditingId(null)}
          qualification={qualifications?.find((q) => q._id === editingId)}
          missions={missions}
        />
      )}
    </div>
  );
}



