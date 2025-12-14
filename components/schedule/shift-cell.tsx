"use client";

import { cn } from "@/lib/utils";
import { SHIFT_COLORS } from "@/lib/constants";
import { CoverageBadge, CoverageStatus } from "./coverage-badge";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface ShiftAssignment {
  _id: Id<"shiftAssignments">;
  role: "PRIMARY" | "BACKUP" | "ON_CALL";
  user: Doc<"users"> | null;
}

interface ShiftCellProps {
  shift: {
    _id: Id<"shiftInstances">;
    status: string;
    assignments: ShiftAssignment[];
    shiftDefinition: Doc<"shiftDefinitions"> | null;
    team: Doc<"teams"> | null;
  };
  coverageStatus?: CoverageStatus;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Individual shift cell for calendar views
 */
export function ShiftCell({
  shift,
  coverageStatus = "green",
  isSelected = false,
  onClick,
  compact = false,
  className,
}: ShiftCellProps) {
  const shiftType = shift.shiftDefinition?.label?.toLowerCase().includes("night")
    ? "night"
    : "day";
  const colors = SHIFT_COLORS[shiftType];

  const primaryAssignees = shift.assignments
    .filter((a) => a.role === "PRIMARY")
    .map((a) => a.user?.name || "Unknown")
    .slice(0, 2);

  const backupCount = shift.assignments.filter((a) => a.role === "BACKUP").length;
  const hasBackups = backupCount > 0;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full p-1 rounded text-xs transition-all",
          "border",
          isSelected && "ring-2 ring-emerald-500",
          className
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between gap-1">
          <CoverageBadge status={coverageStatus} size="sm" />
          <span className="truncate text-[#f5f5f5]">
            {primaryAssignees[0] || "---"}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-2 rounded-lg text-left transition-all",
        "border hover:border-opacity-50",
        isSelected && "ring-2 ring-emerald-500",
        className
      )}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium"
          style={{ color: colors.text }}
        >
          {shift.shiftDefinition?.label || "Shift"}
        </span>
        <CoverageBadge status={coverageStatus} size="sm" />
      </div>

      <div className="space-y-0.5">
        {primaryAssignees.length > 0 ? (
          primaryAssignees.map((name, i) => (
            <div key={i} className="text-sm font-medium text-[#f5f5f5] truncate">
              {name}
            </div>
          ))
        ) : (
          <div className="text-sm text-[#a1a1aa] italic">Unassigned</div>
        )}
      </div>

      {hasBackups && (
        <div className="mt-1 text-xs text-[#a1a1aa]">
          +{backupCount} backup{backupCount > 1 ? "s" : ""}
        </div>
      )}

      {shift.status !== "FINAL" && (
        <div className="mt-1">
          <span
            className={cn(
              "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
              shift.status === "PENDING_APPROVAL"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-zinc-700 text-zinc-400"
            )}
          >
            {shift.status}
          </span>
        </div>
      )}
    </button>
  );
}

interface EmptyShiftCellProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Empty/off shift cell
 */
export function EmptyShiftCell({
  label = "OFF",
  onClick,
  className,
}: EmptyShiftCellProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full p-2 rounded-lg text-center",
        "bg-[#1a1a1a] border border-[#2a2a2a]",
        "text-xs text-[#505050]",
        onClick && "cursor-pointer hover:bg-[#222]",
        className
      )}
    >
      {label}
    </div>
  );
}
