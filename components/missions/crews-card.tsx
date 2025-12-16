"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface CrewWithCount extends Doc<"teams"> {
  memberCount?: number;
}

interface CrewsCardProps {
  crews: CrewWithCount[] | undefined;
  missionId: Id<"zooMissions">;
}

export function CrewsCard({ crews, missionId }: CrewsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crews</CardTitle>
        <Link
          href={`/teams?mission=${missionId}`}
          className="text-sm text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
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
            <Link href={`/teams?mission=${missionId}`} className="text-emerald-500 hover:underline">
              Add one
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



