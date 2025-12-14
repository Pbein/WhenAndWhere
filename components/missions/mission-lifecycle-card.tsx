"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CyclePositionIndicator } from "./cycle-position-indicator";
import { MissionStatusActions } from "./mission-status-actions";

interface MissionLifecycleCardProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
}

export function MissionLifecycleCard({ mission }: MissionLifecycleCardProps) {
  const templates = useQuery(api.templates.list);
  const startSchedule = useMutation(api.schedules.startMissionSchedule);
  const updateMission = useMutation(api.missions.update);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeTemplate = templates?.find((t) => t._id === mission.activeTemplateId);

  const handleTemplateChange = async (templateId: string) => {
    if (!templateId) return;
    setIsSaving(true);
    try {
      await startSchedule({
        missionId: mission._id,
        templateId: templateId as Id<"scheduleTemplates">,
        anchorDate: mission.cycleAnchorDate ?? Date.now(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnchorDateChange = async (dateStr: string) => {
    const date = new Date(dateStr);
    setIsSaving(true);
    try {
      await updateMission({
        id: mission._id,
        cycleAnchorDate: date.getTime(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateForInput = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Schedule Configuration</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          disabled={mission.status === "TERMINATED"}
        >
          {isEditing ? "Done" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">
              Schedule Template
            </label>
            {isEditing ? (
              <select
                value={mission.activeTemplateId ?? ""}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              >
                <option value="">Select template...</option>
                {templates?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-[#f5f5f5]">
                {activeTemplate?.name ?? "Not configured"}
              </div>
            )}
          </div>

          {/* Anchor Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">
              Cycle Anchor Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={
                  mission.cycleAnchorDate
                    ? formatDateForInput(mission.cycleAnchorDate)
                    : ""
                }
                onChange={(e) => handleAnchorDateChange(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-md border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-[#f5f5f5]"
              />
            ) : (
              <div className="text-[#f5f5f5]">
                {mission.cycleAnchorDate
                  ? formatDate(mission.cycleAnchorDate)
                  : "Not set"}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Status</label>
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  mission.status === "ACTIVE"
                    ? "green"
                    : mission.status === "PAUSED"
                      ? "amber"
                      : "gray"
                }
              >
                {mission.status}
              </Badge>
              {isEditing && <MissionStatusActions mission={mission} />}
            </div>
          </div>
        </div>

        {/* Cycle Position Indicator */}
        {mission.activeTemplateId && mission.cycleAnchorDate && (
          <CyclePositionIndicator mission={mission} />
        )}

        {/* Mission Dates */}
        <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#a1a1aa]">
                Mission Start
              </label>
              <div className="text-[#f5f5f5]">
                {mission.startDate ? formatDate(mission.startDate) : "Not set"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#a1a1aa]">
                Mission End
              </label>
              <div className="text-[#f5f5f5]">
                {mission.endDate ? formatDate(mission.endDate) : "Indefinite"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
