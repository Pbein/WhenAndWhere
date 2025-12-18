"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsCardProps {
  mission: Doc<"zooMissions"> & { status: "ACTIVE" | "PAUSED" | "TERMINATED" };
}

export function QuickActionsCard({ mission }: QuickActionsCardProps) {
  const extendSchedule = useMutation(api.schedules.extendSchedule);
  const [isExtending, setIsExtending] = useState(false);

  const handleExtendTwoWeeks = async () => {
    if (!mission.activeTemplateId || !mission.cycleAnchorDate) {
      alert("Please configure a template and anchor date first.");
      return;
    }

    setIsExtending(true);
    try {
      const twoWeeksFromNow = Date.now() + 14 * 24 * 60 * 60 * 1000;
      const result = await extendSchedule({
        missionId: mission._id,
        endDate: twoWeeksFromNow,
      });
      alert(`Generated ${result.generated} shifts!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to extend schedule");
    } finally {
      setIsExtending(false);
    }
  };

  const isConfigured = mission.activeTemplateId && mission.cycleAnchorDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          href={`/schedules?mission=${mission._id}`}
          className="inline-flex w-full items-center justify-start gap-2 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition hover:bg-[#2a2a2a]"
        >
          📅 View Schedule
        </Link>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleExtendTwoWeeks}
          disabled={!isConfigured || isExtending || mission.status !== "ACTIVE"}
        >
          {isExtending ? "⏳ Extending..." : "➕ Extend Schedule 2 Weeks"}
        </Button>

        <Link
          href={`/teams?mission=${mission._id}`}
          className="inline-flex w-full items-center justify-start gap-2 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition hover:bg-[#2a2a2a]"
        >
          👥 Manage Crews
        </Link>

        {!isConfigured && (
          <p className="text-xs text-[#a1a1aa] mt-2">
            Configure a template and anchor date to enable schedule generation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}




