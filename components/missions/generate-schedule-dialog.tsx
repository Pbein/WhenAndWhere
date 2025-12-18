"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { format, addWeeks } from "date-fns";
import { Calendar, Users, Clock, AlertCircle } from "lucide-react";

interface GenerateScheduleDialogProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isGenerating: boolean;
  hasExistingSchedule: boolean;
}

export function GenerateScheduleDialog({
  mission,
  isOpen,
  onClose,
  onConfirm,
  isGenerating,
  hasExistingSchedule,
}: GenerateScheduleDialogProps) {
  const templateRequirements = useQuery(
    api.templates.getTemplateRequirements,
    mission.activeTemplateId ? { templateId: mission.activeTemplateId } : "skip"
  );

  const crews = useQuery(api.teams.listByMissionWithCounts, { missionId: mission._id });
  const shiftDefs = useQuery(api.shiftDefinitions.listByMission, { missionId: mission._id });

  if (!isOpen) return null;

  const startDate = mission.cycleAnchorDate ? new Date(mission.cycleAnchorDate) : new Date();
  const endDate = addWeeks(startDate, 2);
  const totalCrewMembers = crews?.reduce((sum, crew) => sum + (crew.memberCount ?? 0), 0) ?? 0;

  // Rough estimate: 14 days, assume pattern has work days for each crew
  const estimatedShiftsPerCrew = 7; // roughly half the days in 2 weeks
  const estimatedTotalShifts = (crews?.length ?? 0) * estimatedShiftsPerCrew;
  const estimatedAssignments = estimatedTotalShifts * (totalCrewMembers / (crews?.length ?? 1));

  // Determine which crews do day vs night based on pattern
  const dayCrews = crews?.filter((_, index) => index < 2) ?? [];
  const nightCrews = crews?.filter((_, index) => index >= 2) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">
          {hasExistingSchedule ? "Add More Weeks to Schedule" : "Generate Schedule"}
        </h2>

        <div className="space-y-4">
          {/* Date Range */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
            <Calendar className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-[#f5f5f5]">Time Period</div>
              <div className="text-xs text-[#a1a1aa] mt-1">
                {format(startDate, "MMM d, yyyy")} → {format(endDate, "MMM d, yyyy")}
                <span className="ml-1">(2 weeks)</span>
              </div>
            </div>
          </div>

          {/* Pattern Info */}
          {templateRequirements && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
              <Clock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">
                  Pattern: {templateRequirements.templateName}
                </div>
                <div className="text-xs text-[#a1a1aa] mt-1">
                  {templateRequirements.cycleDays}-day cycle, {templateRequirements.shiftLengthHours}h shifts
                </div>
              </div>
            </div>
          )}

          {/* Crew Assignments */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
            <Users className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#f5f5f5] mb-2">
                Crew Assignments
              </div>
              
              {dayCrews.length > 0 && (
                <div className="text-xs text-[#a1a1aa] mb-1">
                  <span className="text-[#f5f5f5] font-medium">Day shifts:</span>{" "}
                  {dayCrews.map(c => c.name).join(", ")}
                </div>
              )}
              
              {nightCrews.length > 0 && (
                <div className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f5f5f5] font-medium">Night shifts:</span>{" "}
                  {nightCrews.map(c => c.name).join(", ")}
                </div>
              )}

              <div className="text-xs text-[#a1a1aa] mt-2">
                {totalCrewMembers} total crew members will be auto-assigned
              </div>
            </div>
          </div>

          {/* Estimates */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-sm font-medium text-emerald-400 mb-2">
              Estimated Results
            </div>
            <div className="space-y-1 text-xs text-emerald-300">
              <div>• ~{estimatedTotalShifts} shift instances</div>
              <div>• ~{Math.round(estimatedAssignments)} assignments</div>
              <div>• {shiftDefs?.length ?? 0} shift time types</div>
            </div>
          </div>

          {/* Warning if setup incomplete */}
          {totalCrewMembers === 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-400">
                No crew members found. Shifts will be created but won't have any assignments.
                Add members to crews first for best results.
              </div>
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-[#a1a1aa]">
            {hasExistingSchedule
              ? "This will add more shifts to your existing schedule."
              : "This will create your initial schedule with all crew members assigned to their shifts."} 
            {" "}You can adjust assignments later.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#2a2a2a]">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating
              ? "Generating..."
              : hasExistingSchedule
              ? "Add Weeks"
              : "Generate Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}

