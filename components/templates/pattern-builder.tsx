"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PatternCell, ShiftState } from "./pattern-cell";
import { PatternDay, patternToJson, parsePattern } from "@/lib/template-presets";

interface PatternBuilderProps {
  cycleDays: number;
  crewCount: number;
  initialPatternJson: string;
  onChange: (patternJson: string) => void;
  disabled?: boolean;
}

/**
 * Build a pattern map from configuration and existing pattern JSON
 */
function buildPatternMap(
  crewCount: number,
  cycleDays: number,
  patternJson: string
): Map<number, ShiftState[]> {
  const map = new Map<number, ShiftState[]>();

  // Initialize all crews with off states for all days
  for (let crew = 0; crew < crewCount; crew++) {
    map.set(crew, Array(cycleDays).fill("off"));
  }

  // Apply existing pattern data
  const parsed = parsePattern(patternJson);
  parsed.forEach((p: PatternDay) => {
    const crewPattern = map.get(p.crewIndex);
    if (crewPattern && p.dayIndex < cycleDays) {
      crewPattern[p.dayIndex] = p.work
        ? p.shiftDefinitionKey === "day"
          ? "day"
          : "night"
        : "off";
    }
  });

  return map;
}

export function PatternBuilder({
  cycleDays,
  crewCount,
  initialPatternJson,
  onChange,
  disabled,
}: PatternBuilderProps) {
  // Track previous values to detect changes
  const prevCrewCount = useRef(crewCount);
  const prevCycleDays = useRef(cycleDays);

  // Initialize state from pattern JSON
  const [pattern, setPattern] = useState<Map<number, ShiftState[]>>(() =>
    buildPatternMap(crewCount, cycleDays, initialPatternJson)
  );

  // Update pattern when crewCount or cycleDays changes
  useEffect(() => {
    const crewCountChanged = prevCrewCount.current !== crewCount;
    const cycleDaysChanged = prevCycleDays.current !== cycleDays;

    if (crewCountChanged || cycleDaysChanged) {
      setPattern((prev) => {
        const newMap = new Map<number, ShiftState[]>();

        // Rebuild pattern preserving existing data where possible
        for (let crew = 0; crew < crewCount; crew++) {
          const existingCrewData = prev.get(crew);
          const newCrewData: ShiftState[] = [];

          for (let day = 0; day < cycleDays; day++) {
            // Preserve existing state if available, otherwise default to off
            newCrewData[day] = existingCrewData?.[day] ?? "off";
          }

          newMap.set(crew, newCrewData);
        }

        return newMap;
      });

      prevCrewCount.current = crewCount;
      prevCycleDays.current = cycleDays;
    }
  }, [crewCount, cycleDays]);

  // Convert map to PatternDay array
  const patternToArray = useCallback(
    (map: Map<number, ShiftState[]>): PatternDay[] => {
      const result: PatternDay[] = [];
      map.forEach((states, crewIndex) => {
        states.forEach((state, dayIndex) => {
          result.push({
            dayIndex,
            crewIndex,
            work: state !== "off",
            shiftDefinitionKey: state === "night" ? "night" : "day",
          });
        });
      });
      return result;
    },
    []
  );

  const cycleCell = useCallback(
    (crewIndex: number, dayIndex: number) => {
      if (disabled) return;

      setPattern((prev) => {
        const newPattern = new Map(prev);
        const crewStates = [...(newPattern.get(crewIndex) ?? [])];
        const current = crewStates[dayIndex];

        // Cycle: off -> day -> night -> off
        const next: ShiftState =
          current === "off" ? "day" : current === "day" ? "night" : "off";

        crewStates[dayIndex] = next;
        newPattern.set(crewIndex, crewStates);

        // Notify parent
        onChange(patternToJson(patternToArray(newPattern)));

        return newPattern;
      });
    },
    [disabled, onChange, patternToArray]
  );

  const crewLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-fit"
          style={{
            gridTemplateColumns: `80px repeat(${cycleDays}, minmax(36px, 1fr))`,
          }}
        >
          {/* Header row with day numbers */}
          <div className="text-xs text-[#a1a1aa] p-2 font-medium">Crew</div>
          {Array.from({ length: cycleDays }).map((_, i) => (
            <div
              key={i}
              className="text-xs text-[#a1a1aa] p-2 text-center font-medium"
            >
              {i + 1}
            </div>
          ))}

          {/* Crew rows */}
          {Array.from({ length: crewCount }).map((_, crewIndex) => (
            <>
              <div
                key={`label-${crewIndex}`}
                className="text-sm font-medium text-[#f5f5f5] p-2 flex items-center"
              >
                Crew {crewLabels[crewIndex] ?? crewIndex + 1}
              </div>
              {(pattern.get(crewIndex) ?? []).map((state, dayIndex) => (
                <PatternCell
                  key={`${crewIndex}-${dayIndex}`}
                  state={state}
                  onClick={() => cycleCell(crewIndex, dayIndex)}
                  disabled={disabled}
                />
              ))}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pt-4 border-t border-[#2a2a2a]">
        <div className="text-xs text-[#a1a1aa]">Click cells to cycle:</div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-[#2a2a2a]" />
          <span className="text-xs text-[#a1a1aa]">Off</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-amber-500" />
          <span className="text-xs text-[#a1a1aa]">Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-indigo-500" />
          <span className="text-xs text-[#a1a1aa]">Night</span>
        </div>
      </div>
    </div>
  );
}
