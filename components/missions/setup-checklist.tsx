"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, AlertCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupChecklistProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
  missionId: Id<"zooMissions">;
}

interface SetupStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  actionLabel?: string;
  actionHref?: string;
  warning?: string;
}

export function SetupChecklist({ mission, missionId }: SetupChecklistProps) {
  // Fetch data needed to determine completion
  const templateRequirements = useQuery(
    api.templates.getTemplateRequirements,
    mission.activeTemplateId ? { templateId: mission.activeTemplateId } : "skip"
  );
  
  const shiftDefs = useQuery(api.shiftDefinitions.listByMission, { missionId });
  const crews = useQuery(api.teams.listByMissionWithCounts, { missionId });
  const lastGeneratedDate = useQuery(api.schedules.getLastGeneratedDate, { missionId });

  // Determine step completion
  const hasTemplate = !!mission.activeTemplateId && !!mission.cycleAnchorDate;
  const requiredCrewCount = templateRequirements?.requiredCrewCount ?? 0;
  const actualCrewCount = crews?.length ?? 0;
  const hasEnoughCrews = requiredCrewCount > 0 && actualCrewCount >= requiredCrewCount;
  const hasShiftDefs = (shiftDefs?.length ?? 0) >= 2; // Need at least Day and Night
  const crewsHaveMembers = crews?.some(c => (c.memberCount ?? 0) > 0) ?? false;
  const hasGeneratedSchedule = !!lastGeneratedDate;

  const steps: SetupStep[] = [
    {
      id: "mission",
      label: "Mission created",
      completed: true,
    },
    {
      id: "template",
      label: hasTemplate
        ? `Schedule pattern: ${templateRequirements?.templateName || "Selected"}`
        : "Select schedule pattern",
      description: hasTemplate
        ? `${requiredCrewCount} crews required`
        : "Choose rotation pattern (e.g., Panama 2-2-3)",
      completed: hasTemplate,
      actionLabel: hasTemplate ? undefined : "Configure",
      actionHref: `/missions/${missionId}`,
    },
    {
      id: "shifts",
      label: hasShiftDefs
        ? `Shift times configured (${shiftDefs?.length ?? 0})`
        : "Define shift times",
      description: hasShiftDefs
        ? undefined
        : "Set work hours (Day & Night shifts)",
      completed: hasShiftDefs,
      actionLabel: hasShiftDefs ? undefined : "Add Shifts",
      actionHref: `/missions/${missionId}`,
    },
    {
      id: "crews",
      label: hasEnoughCrews
        ? `${actualCrewCount} crews created`
        : `Create crews (${actualCrewCount} of ${requiredCrewCount})`,
      description: !hasEnoughCrews && requiredCrewCount > 0
        ? `Need ${requiredCrewCount - actualCrewCount} more`
        : undefined,
      completed: hasEnoughCrews,
      actionLabel: hasEnoughCrews ? undefined : "Create Crew",
      actionHref: `/teams?mission=${missionId}`,
      warning: !hasEnoughCrews && actualCrewCount > 0 ? "Incomplete" : undefined,
    },
    {
      id: "members",
      label: crewsHaveMembers
        ? "Crew members assigned"
        : "Assign members to crews",
      description: crewsHaveMembers
        ? undefined
        : "Add employees to each crew",
      completed: crewsHaveMembers,
      actionLabel: crewsHaveMembers ? undefined : "Add Members",
      actionHref: `/teams?mission=${missionId}`,
    },
    {
      id: "generate",
      label: hasGeneratedSchedule
        ? "Schedule generated"
        : "Generate schedule",
      description: hasGeneratedSchedule
        ? undefined
        : "Create shifts based on pattern",
      completed: hasGeneratedSchedule,
      actionLabel: hasGeneratedSchedule ? "View Schedule" : undefined,
      actionHref: hasGeneratedSchedule ? `/schedules?mission=${missionId}` : undefined,
    },
  ];

  // Check if setup is complete
  const isSetupComplete = steps.every(step => step.completed);

  // If setup is complete, show a compact summary
  if (isSetupComplete) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-emerald-400">Setup Complete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#a1a1aa]">
            Mission is configured and schedule is generated. You can extend the schedule or
            manage assignments as needed.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find the first incomplete step
  const nextStep = steps.find(step => !step.completed);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-amber-400">Complete Setup to Generate Schedule</CardTitle>
        </div>
        <p className="text-sm text-[#a1a1aa] mt-1">
          Follow these steps to set up your mission schedule
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                step.completed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : step.warning
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-[#2a2a2a] bg-[#111111]"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                ) : step.warning ? (
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                ) : (
                  <Circle className="h-5 w-5 text-[#505050]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        step.completed
                          ? "text-emerald-400"
                          : step.warning
                          ? "text-amber-400"
                          : "text-[#f5f5f5]"
                      )}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-[#a1a1aa] mt-0.5">
                        {step.description}
                      </div>
                    )}
                  </div>
                  {step.actionLabel && step.actionHref && (
                    <Link href={step.actionHref}>
                      <Button
                        size="sm"
                        variant={nextStep?.id === step.id ? "default" : "outline"}
                        className={cn(
                          "flex-shrink-0",
                          nextStep?.id === step.id && "bg-emerald-600 hover:bg-emerald-700"
                        )}
                      >
                        {step.actionLabel}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {nextStep && (
          <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <div className="flex items-start gap-2">
              <div className="text-sm text-[#a1a1aa]">
                <span className="font-medium text-[#f5f5f5]">Next step:</span> {nextStep.label}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

