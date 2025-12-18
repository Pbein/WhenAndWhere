"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { AlertTriangle, Users } from "lucide-react";

interface CrewWithCount extends Doc<"teams"> {
  memberCount?: number;
}

interface CrewsCardProps {
  crews: CrewWithCount[] | undefined;
  missionId: Id<"zooMissions">;
  templateId?: Id<"scheduleTemplates"> | null;
}

export function CrewsCard({ crews, missionId, templateId }: CrewsCardProps) {
  const templateRequirements = useQuery(
    api.templates.getTemplateRequirements,
    templateId ? { templateId } : "skip"
  );

  const crewCount = crews?.length ?? 0;
  const requiredCount = templateRequirements?.requiredCrewCount ?? 0;
  const hasTemplate = templateId && requiredCount > 0;
  const isInsufficient = hasTemplate && crewCount < requiredCount;
  const isSufficient = hasTemplate && crewCount >= requiredCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Crews</CardTitle>
          <Link
            href={`/teams?mission=${missionId}`}
            className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
          >
            Manage
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Requirements banner */}
        {hasTemplate && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              isInsufficient
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {isInsufficient ? (
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Users className="h-4 w-4 flex-shrink-0" />
            )}
            <div className="flex-1 text-sm">
              <div className="font-medium">
                {crewCount} of {requiredCount} crews assigned
              </div>
              {isInsufficient && (
                <div className="text-xs mt-0.5 opacity-90">
                  {templateRequirements?.templateName} requires {requiredCount} crews
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crew list */}
        <div className="space-y-2">
          {crews?.map((crew) => (
            <div
              key={crew._id}
              className="flex items-center justify-between p-3 rounded bg-[#111111]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: crew.color ?? "#10b981" }}
                />
                <div>
                  <div className="font-medium text-[#f5f5f5]">{crew.name}</div>
                  {crew.focus && (
                    <div className="text-xs text-[#a1a1aa]">{crew.focus}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {crew.shiftPreference && (
                  <Badge tone="blue" className="text-xs">
                    {crew.shiftPreference}
                  </Badge>
                )}
                <span className="text-sm text-[#a1a1aa]">
                  {crew.memberCount ?? 0} members
                </span>
              </div>
            </div>
          ))}
          {(!crews || crews.length === 0) && (
            <div className="text-sm text-[#a1a1aa] py-4 text-center">
              No crews configured.{" "}
              <Link
                href={`/teams?mission=${missionId}`}
                className="text-emerald-500 hover:underline"
              >
                Add one
              </Link>
            </div>
          )}
        </div>

        {/* Action button */}
        {isInsufficient && (
          <Link href={`/teams?mission=${missionId}`}>
            <Button variant="outline" className="w-full">
              Create Missing Crews
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}





