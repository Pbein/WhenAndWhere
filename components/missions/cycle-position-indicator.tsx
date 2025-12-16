"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface CyclePositionIndicatorProps {
  mission: Doc<"zooMissions">;
}

export function CyclePositionIndicator({ mission }: CyclePositionIndicatorProps) {
  const template = useQuery(
    api.templates.get,
    mission.activeTemplateId ? { id: mission.activeTemplateId } : "skip"
  );

  if (!template || !mission.cycleAnchorDate) return null;

  const today = Date.now();
  const daysSinceAnchor = Math.floor(
    (today - mission.cycleAnchorDate) / (24 * 60 * 60 * 1000)
  );
  const cycleDay = ((daysSinceAnchor % template.cycleDays) + template.cycleDays) % template.cycleDays;
  const cycleNumber = Math.floor(daysSinceAnchor / template.cycleDays) + 1;
  const daysUntilNextCycle = template.cycleDays - cycleDay;

  const nextCycleDate = new Date(today + daysUntilNextCycle * 24 * 60 * 60 * 1000);
  const nextCycleDateStr = nextCycleDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#a1a1aa]">Current Cycle Position</span>
        <span className="text-xs text-[#a1a1aa]">Cycle #{cycleNumber}</span>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: template.cycleDays }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 flex-1 rounded-sm transition-colors",
              i < cycleDay
                ? "bg-emerald-600"
                : i === cycleDay
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-[#2a2a2a]"
            )}
            title={`Day ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex justify-between mt-2 text-xs text-[#a1a1aa]">
        <span>
          Day {cycleDay + 1} of {template.cycleDays}
        </span>
        <span>Next cycle: {nextCycleDateStr}</span>
      </div>
    </div>
  );
}



