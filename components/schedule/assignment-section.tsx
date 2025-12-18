"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  onSwap?: (assignmentId: Id<"shiftAssignments">) => void;
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
  onSwap,
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
              onSwap={onSwap ? () => onSwap(assignment._id) : undefined}
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
  onSwap?: () => void;
}

function AssignmentCard({ assignment, onRemove, onSwap }: AssignmentCardProps) {
  const user = assignment.user;

  // Fetch crew memberships for this user
  const crewMemberships = useQuery(
    api.teams.getUserCrews,
    user?._id ? { userId: user._id } : "skip"
  );

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
          <User className="h-4 w-4 text-[#a1a1aa]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#f5f5f5] truncate">
              {user?.name || user?.email || "Unknown User"}
            </span>

            {/* Crew badges */}
            {crewMemberships && crewMemberships.length > 0 && (
              <>
                {crewMemberships.slice(0, 2).map((membership) => (
                  <Badge
                    key={membership._id}
                    tone={membership.isPrimary ? "green" : "blue"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {membership.team?.name || "Unknown Crew"}
                  </Badge>
                ))}
                {crewMemberships.length > 2 && (
                  <span className="text-[10px] text-[#a1a1aa]">
                    +{crewMemberships.length - 2}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Qualifications */}
          {assignment.qualifications && assignment.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
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

      <div className="flex items-center gap-1 flex-shrink-0">
        {onSwap && (
          <button
            onClick={onSwap}
            className="p-1 rounded text-[#505050] hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Swap assignment"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4M7 4L3 8M7 4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1 rounded text-[#505050] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove assignment"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}





