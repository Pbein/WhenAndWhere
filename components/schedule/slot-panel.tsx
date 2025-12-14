"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CoverageSummary } from "./coverage-summary";
import { AssignmentSection } from "./assignment-section";
import { EmployeeList } from "./employee-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";

type AssignmentRole = "PRIMARY" | "BACKUP" | "ON_CALL";

interface SlotPanelProps {
  shiftId: Id<"shiftInstances"> | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Side panel for viewing and managing shift assignments
 */
export function SlotPanel({
  shiftId,
  isOpen,
  onClose,
  className,
}: SlotPanelProps) {
  const [addingRole, setAddingRole] = useState<AssignmentRole | null>(null);

  const shift = useQuery(
    api.schedules.getShiftWithAssignments,
    shiftId ? { shiftId } : "skip"
  );

  const assignUser = useMutation(api.schedules.assignUser);
  const removeAssignment = useMutation(api.schedules.removeAssignment);

  const handleAssign = async (userId: Id<"users">) => {
    if (!shiftId || !addingRole) return;
    await assignUser({
      shiftInstanceId: shiftId,
      userId,
      role: addingRole,
    });
    setAddingRole(null);
  };

  const handleRemove = async (assignmentId: Id<"shiftAssignments">) => {
    await removeAssignment({ assignmentId });
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-96 bg-[#0a0a0a] border-l border-[#2a2a2a]",
        "flex flex-col shadow-2xl",
        "animate-in slide-in-from-right duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          {addingRole && (
            <button
              onClick={() => setAddingRole(null)}
              className="p-1 rounded hover:bg-[#2a2a2a] text-[#a1a1aa]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-[#f5f5f5]">
            {addingRole ? `Add ${addingRole.toLowerCase()}` : "Shift Details"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#2a2a2a] text-[#a1a1aa]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      {addingRole && shiftId ? (
        <EmployeeList
          shiftId={shiftId}
          role={addingRole}
          onSelect={handleAssign}
          onClose={() => setAddingRole(null)}
          className="flex-1"
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {!shift ? (
            <div className="p-4 space-y-4">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-48 bg-[#2a2a2a] rounded" />
                <div className="h-4 w-32 bg-[#2a2a2a] rounded" />
                <div className="h-20 bg-[#2a2a2a] rounded" />
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Shift info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#f5f5f5]">
                  <Calendar className="h-4 w-4 text-[#a1a1aa]" />
                  <span className="font-medium">
                    {format(new Date(shift.dateStart), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#a1a1aa]">
                  <Clock className="h-4 w-4" />
                  <span>
                    {shift.shiftDefinition?.label || "Shift"}:{" "}
                    {shift.shiftDefinition?.startTime} - {shift.shiftDefinition?.endTime}
                  </span>
                </div>

                {shift.team && (
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <Users className="h-4 w-4" />
                    <span>{shift.team.name}</span>
                  </div>
                )}

                {shift.mission && (
                  <div className="flex items-center gap-2 text-[#a1a1aa]">
                    <MapPin className="h-4 w-4" />
                    <span>{shift.mission.name}</span>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      shift.status === "FINAL"
                        ? "green"
                        : shift.status === "PENDING_APPROVAL"
                        ? "amber"
                        : "gray"
                    }
                  >
                    {shift.status}
                  </Badge>
                </div>
              </div>

              {/* Coverage status */}
              <div className="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
                <CoverageSummary shiftId={shift._id} />
              </div>

              {/* Assignments */}
              <div className="space-y-4">
                <AssignmentSection
                  title="Primary"
                  role="PRIMARY"
                  assignments={shift.assignments.filter((a) => a.role === "PRIMARY")}
                  required={shift.shiftDefinition?.minPrimary ?? 1}
                  onAdd={() => setAddingRole("PRIMARY")}
                  onRemove={handleRemove}
                />

                <div className="border-t border-[#2a2a2a]" />

                <AssignmentSection
                  title="Backup"
                  role="BACKUP"
                  assignments={shift.assignments.filter((a) => a.role === "BACKUP")}
                  required={shift.shiftDefinition?.minBackup ?? 0}
                  onAdd={() => setAddingRole("BACKUP")}
                  onRemove={handleRemove}
                />

                <div className="border-t border-[#2a2a2a]" />

                <AssignmentSection
                  title="On-Call"
                  role="ON_CALL"
                  assignments={shift.assignments.filter((a) => a.role === "ON_CALL")}
                  required={0}
                  onAdd={() => setAddingRole("ON_CALL")}
                  onRemove={handleRemove}
                />
              </div>

              {/* Callout warning if any assigned users have called out */}
              {shift.assignments.some((a) => a.notes?.includes("[CALLED OUT]")) && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-400">
                    One or more assigned employees have called out for this shift.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
