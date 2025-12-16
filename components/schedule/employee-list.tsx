"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Check, AlertTriangle, Clock } from "lucide-react";

interface EmployeeListProps {
  shiftId: Id<"shiftInstances">;
  role: "PRIMARY" | "BACKUP" | "ON_CALL";
  onSelect: (userId: Id<"users">) => void;
  onClose: () => void;
  className?: string;
}

/**
 * Filterable employee picker for shift assignments
 */
export function EmployeeList({
  shiftId,
  role,
  onSelect,
  onClose,
  className,
}: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [showCrewOnly, setShowCrewOnly] = useState(true);

  const candidates = useQuery(api.schedules.getEligibleReplacements, {
    shiftInstanceId: shiftId,
  });

  // Filter and sort candidates
  const filtered = useMemo(() => {
    if (!candidates) return [];

    return candidates
      .filter((c) => {
        // Search filter
        if (search) {
          const name = c.user.name?.toLowerCase() || "";
          const email = c.user.email?.toLowerCase() || "";
          const searchLower = search.toLowerCase();
          if (!name.includes(searchLower) && !email.includes(searchLower)) {
            return false;
          }
        }

        // Crew filter
        if (showCrewOnly && !c.isCrewMember) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Already assigned at the bottom
        if (a.availability === "already_assigned" && b.availability !== "already_assigned")
          return 1;
        if (b.availability === "already_assigned" && a.availability !== "already_assigned")
          return -1;

        // On PTO near bottom
        if (a.availability === "on_pto" && b.availability !== "on_pto") return 1;
        if (b.availability === "on_pto" && a.availability !== "on_pto") return -1;

        // Primary crew first
        if (a.isPrimaryCrew && !b.isPrimaryCrew) return -1;
        if (b.isPrimaryCrew && !a.isPrimaryCrew) return 1;

        // Qualified first
        if (a.hasRequiredQualification && !b.hasRequiredQualification) return -1;
        if (b.hasRequiredQualification && !a.hasRequiredQualification) return 1;

        return (a.user.name ?? "").localeCompare(b.user.name ?? "");
      });
  }, [candidates, search, showCrewOnly]);

  if (!candidates) {
    return (
      <div className={cn("p-4", className)}>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-[#2a2a2a]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Search and filters */}
      <div className="p-3 border-b border-[#2a2a2a] space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] placeholder:text-[#505050]"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-[#a1a1aa] cursor-pointer">
          <input
            type="checkbox"
            checked={showCrewOnly}
            onChange={(e) => setShowCrewOnly(e.target.checked)}
            className="rounded border-[#2a2a2a] bg-[#1a1a1a] text-emerald-500 focus:ring-emerald-500"
          />
          Show crew members only
        </label>
      </div>

      {/* Employee list */}
      <div className="flex-1 overflow-y-auto max-h-64">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#a1a1aa]">
            No eligible employees found
          </div>
        ) : (
          <div className="p-1">
            {filtered.map((candidate) => (
              <EmployeeRow
                key={candidate.user._id}
                user={candidate.user}
                qualifications={candidate.qualifications}
                isPrimaryCrew={candidate.isPrimaryCrew}
                isCrewMember={candidate.isCrewMember}
                hasRequiredQualification={candidate.hasRequiredQualification}
                availability={candidate.availability}
                onClick={() => {
                  if (candidate.availability === "available") {
                    onSelect(candidate.user._id);
                    onClose();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EmployeeRowProps {
  user: Doc<"users">;
  qualifications: Array<{
    qualification: Doc<"qualifications"> | null;
    status: string;
  }>;
  isPrimaryCrew: boolean;
  isCrewMember: boolean;
  hasRequiredQualification: boolean;
  availability: "available" | "on_pto" | "already_assigned";
  onClick: () => void;
}

function EmployeeRow({
  user,
  qualifications,
  isPrimaryCrew,
  isCrewMember,
  hasRequiredQualification,
  availability,
  onClick,
}: EmployeeRowProps) {
  const isDisabled = availability !== "available";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full p-2 rounded-lg text-left transition-colors",
        "hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-emerald-500",
        isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
          <User className="h-4 w-4 text-[#a1a1aa]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#f5f5f5] truncate">
              {user.name || user.email}
            </span>
            {isPrimaryCrew && (
              <Badge tone="green" className="text-[10px] px-1.5 py-0">
                Primary
              </Badge>
            )}
            {isCrewMember && !isPrimaryCrew && (
              <Badge tone="blue" className="text-[10px] px-1.5 py-0">
                Crew
              </Badge>
            )}
          </div>

          {/* Qualifications */}
          <div className="flex flex-wrap gap-1 mt-1">
            {qualifications.slice(0, 3).map((q, i) => (
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
            {qualifications.length > 3 && (
              <span className="text-[10px] text-[#a1a1aa]">
                +{qualifications.length - 3} more
              </span>
            )}
          </div>

          {/* Availability status */}
          {availability !== "available" && (
            <div className="flex items-center gap-1 mt-1 text-xs">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400">
                {availability === "on_pto" ? "On PTO" : "Already assigned"}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}



