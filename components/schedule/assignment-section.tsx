"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { User, X, Plus, Check, Clock } from "lucide-react";

interface Assignment {
  _id: Id<"shiftAssignments">;
  role: "PRIMARY" | "BACKUP" | "ON_CALL";
  user: Doc<"users"> | null;
  qualifications?: Array<{
    qualification: Doc<"qualifications"> | null;
    status: string;
  }>;
}

interface AssignmentSectionProps {
  title: string;
  role: "PRIMARY" | "BACKUP" | "ON_CALL";
  assignments: Assignment[];
  required: number;
  onAdd: () => void;
  onRemove: (assignmentId: Id<"shiftAssignments">) => void;
  className?: string;
}

/**
 * Section displaying assignments of a specific role within the slot panel
 */
export function AssignmentSection({
  title,
  role,
  assignments,
  required,
  onAdd,
  onRemove,
  className,
}: AssignmentSectionProps) {
  const count = assignments.length;
  const isFilled = count >= required;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
            {title}
          </span>
          <span
            className={cn(
              "text-xs",
              isFilled ? "text-emerald-400" : "text-amber-400"
            )}
          >
            ({count}/{required} required)
          </span>
        </div>
      </div>

      {/* Assignments list */}
      {assignments.length > 0 ? (
        <div className="space-y-1">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onRemove={() => onRemove(assignment._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-[#505050] italic py-2">
          No {title.toLowerCase()} assigned
        </div>
      )}

      {/* Add button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full border-dashed border-[#2a2a2a] text-[#a1a1aa] hover:text-[#f5f5f5] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add {title}
      </Button>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  onRemove: () => void;
}

function AssignmentCard({ assignment, onRemove }: AssignmentCardProps) {
  const user = assignment.user;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
          <User className="h-4 w-4 text-[#a1a1aa]" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-[#f5f5f5] truncate">
            {user?.name || user?.email || "Unknown User"}
          </div>

          {/* Qualifications */}
          {assignment.qualifications && assignment.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {assignment.qualifications.slice(0, 2).map((q, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded",
                    q.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {q.status === "ACTIVE" ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <Clock className="h-2.5 w-2.5" />
                  )}
                  {q.qualification?.name || "Unknown"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded text-[#505050] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove assignment"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
