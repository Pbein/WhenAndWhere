"use client";

import { useMemo } from "react";
import { PatternDay, parsePattern } from "@/lib/template-presets";

interface PatternPreviewProps {
  patternJson: string;
  cycleDays: number;
}

export function PatternPreview({ patternJson, cycleDays }: PatternPreviewProps) {
  const pattern = parsePattern(patternJson);

  // Group by day to show who's on each shift
  const byDay = useMemo(() => {
    const map = new Map<number, { day: number[]; night: number[] }>();

    for (let i = 0; i < cycleDays; i++) {
      map.set(i, { day: [], night: [] });
    }

    pattern.forEach((p: PatternDay) => {
      if (p.work && p.dayIndex < cycleDays) {
        const dayData = map.get(p.dayIndex);
        if (dayData) {
          if (p.shiftDefinitionKey === "day") {
            dayData.day.push(p.crewIndex);
          } else {
            dayData.night.push(p.crewIndex);
          }
        }
      }
    });

    return map;
  }, [pattern, cycleDays]);

  const crewLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const formatCrews = (indices: number[]) => {
    if (indices.length === 0) return "-";
    return indices.map((i) => crewLabels[i] ?? i + 1).join(", ");
  };

  // Display in rows of 7 days
  const rows = [];
  for (let start = 0; start < cycleDays; start += 7) {
    const end = Math.min(start + 7, cycleDays);
    rows.push({ start, end });
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-[#f5f5f5]">Pattern Preview</div>

      {rows.map(({ start, end }, rowIndex) => (
        <div key={rowIndex} className="grid gap-1" style={{
          gridTemplateColumns: `repeat(${end - start}, 1fr)`,
        }}>
          {Array.from({ length: end - start }).map((_, i) => {
            const dayIndex = start + i;
            const crews = byDay.get(dayIndex);
            return (
              <div
                key={dayIndex}
                className="p-2 rounded bg-[#111111] text-xs"
              >
                <div className="font-medium mb-1 text-[#f5f5f5]">
                  Day {dayIndex + 1}
                </div>
                <div className="text-amber-400">D: {formatCrews(crews?.day ?? [])}</div>
                <div className="text-indigo-400">N: {formatCrews(crews?.night ?? [])}</div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Coverage Summary */}
      <div className="text-xs text-[#a1a1aa] pt-2 border-t border-[#2a2a2a]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            Day shifts:{" "}
            {Array.from(byDay.values()).filter((d) => d.day.length > 0).length} of{" "}
            {cycleDays} days covered
          </div>
          <div>
            Night shifts:{" "}
            {Array.from(byDay.values()).filter((d) => d.night.length > 0).length} of{" "}
            {cycleDays} nights covered
          </div>
        </div>
      </div>
    </div>
  );
}




