"use client";

import { useMemo } from "react";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Sun, Moon, AlertCircle } from "lucide-react";

export interface ScheduleFilters {
  crewIds: Id<"teams">[];
  shiftType: "day" | "night" | "all";
  showUnassignedOnly: boolean;
}

export const DEFAULT_FILTERS: ScheduleFilters = {
  crewIds: [],
  shiftType: "all",
  showUnassignedOnly: false,
};

interface FilterBarProps {
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  crews: Doc<"teams">[] | undefined;
  className?: string;
}

/**
 * Filter bar for schedule views. Provides filtering by crew, shift type,
 * and unassigned-only toggle.
 */
export function FilterBar({
  filters,
  onFiltersChange,
  crews,
  className,
}: FilterBarProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.crewIds.length > 0) count++;
    if (filters.shiftType !== "all") count++;
    if (filters.showUnassignedOnly) count++;
    return count;
  }, [filters]);

  const toggleCrew = (crewId: Id<"teams">) => {
    const newCrewIds = filters.crewIds.includes(crewId)
      ? filters.crewIds.filter((id) => id !== crewId)
      : [...filters.crewIds, crewId];
    onFiltersChange({ ...filters, crewIds: newCrewIds });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] bg-[#111111]",
        className
      )}
    >
      {/* Filter icon and label */}
      <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
        <Filter className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>

      <div className="h-4 w-px bg-[#2a2a2a]" />

      {/* Crew filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {crews?.map((crew) => {
          const isSelected = filters.crewIds.includes(crew._id);
          return (
            <button
              key={crew._id}
              onClick={() => toggleCrew(crew._id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                "border",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                  : "border-[#2a2a2a] bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5] hover:border-[#3a3a3a]"
              )}
              style={isSelected && crew.color ? { borderColor: crew.color } : undefined}
            >
              {crew.name}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-[#2a2a2a]" />

      {/* Shift type toggle */}
      <div className="flex rounded-lg border border-[#2a2a2a] overflow-hidden">
        <button
          onClick={() => onFiltersChange({ ...filters, shiftType: "all" })}
          className={cn(
            "px-2.5 py-1 text-xs font-medium transition-colors",
            filters.shiftType === "all"
              ? "bg-[#2a2a2a] text-[#f5f5f5]"
              : "bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5]"
          )}
        >
          All
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, shiftType: "day" })}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors border-l border-[#2a2a2a]",
            filters.shiftType === "day"
              ? "bg-amber-500/20 text-amber-400"
              : "bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5]"
          )}
        >
          <Sun className="h-3 w-3" />
          Day
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, shiftType: "night" })}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-colors border-l border-[#2a2a2a]",
            filters.shiftType === "night"
              ? "bg-indigo-500/20 text-indigo-400"
              : "bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5]"
          )}
        >
          <Moon className="h-3 w-3" />
          Night
        </button>
      </div>

      <div className="h-4 w-px bg-[#2a2a2a]" />

      {/* Unassigned only toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showUnassignedOnly}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              showUnassignedOnly: e.target.checked,
            })
          }
          className="h-3.5 w-3.5 rounded border-[#3a3a3a] bg-[#1a1a1a] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
        />
        <span className="flex items-center gap-1 text-xs text-[#a1a1aa]">
          <AlertCircle className="h-3 w-3" />
          Gaps only
        </span>
      </label>

      {/* Clear filters button */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs text-[#a1a1aa] hover:text-[#f5f5f5]"
          >
            <X className="h-3 w-3 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        </>
      )}
    </div>
  );
}
