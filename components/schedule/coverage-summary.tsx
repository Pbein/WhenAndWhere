"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CoverageBadge, CoverageStatus } from "./coverage-badge";
import { cn } from "@/lib/utils";

interface CoverageSummaryProps {
  shiftId: Id<"shiftInstances">;
  compact?: boolean;
  className?: string;
}

/**
 * Displays coverage status summary for a shift instance
 */
export function CoverageSummary({
  shiftId,
  compact = false,
  className,
}: CoverageSummaryProps) {
  const coverage = useQuery(api.schedules.getShiftCoverageStatus, {
    shiftInstanceId: shiftId,
  });

  if (!coverage) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 w-16 rounded bg-[#2a2a2a]" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <CoverageBadge status={coverage.status as CoverageStatus} />
        <span className="text-xs text-[#a1a1aa]">
          {coverage.assignedPrimary}/{coverage.requiredPrimary}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("coverage-summary space-y-2", className)}>
      <div className="flex items-center gap-2">
        <CoverageBadge
          status={coverage.status as CoverageStatus}
          size="md"
        />
        <span className="text-sm font-medium text-[#f5f5f5]">
          {coverage.message}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#a1a1aa]">
        <div>
          Primary: {coverage.assignedPrimary}/{coverage.requiredPrimary}
        </div>
        <div>
          Backup: {coverage.assignedBackup}/{coverage.requiredBackup}
        </div>
      </div>
      {coverage.missingQualifications.length > 0 && (
        <div className="text-xs text-amber-400">
          Missing: {coverage.missingQualifications.join(", ")}
        </div>
      )}
    </div>
  );
}
