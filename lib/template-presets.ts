// Template presets for common rotation patterns

export interface PatternDay {
  dayIndex: number;
  crewIndex: number;
  work: boolean;
  shiftDefinitionKey: "day" | "night";
}

// Panama 2-2-3 pattern for 4 crews over 14 days
// Each crew works 2-2-3-2-2-3 pattern alternating days and nights
function generatePanamaPattern(): PatternDay[] {
  const pattern: PatternDay[] = [];

  // Crew A pattern (days): 2 on, 2 off, 3 on, 2 off, 2 on, 3 off
  const crewADays = [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0];
  // Crew B pattern (days): offset by 3.5 days from A
  const crewBDays = [0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];
  // Crew C pattern (nights): same as A but nights
  const crewCDays = [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0];
  // Crew D pattern (nights): same as B but nights
  const crewDDays = [0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];

  // Add Crew A (days)
  crewADays.forEach((work, dayIndex) => {
    pattern.push({
      dayIndex,
      crewIndex: 0,
      work: work === 1,
      shiftDefinitionKey: "day",
    });
  });

  // Add Crew B (days)
  crewBDays.forEach((work, dayIndex) => {
    pattern.push({
      dayIndex,
      crewIndex: 1,
      work: work === 1,
      shiftDefinitionKey: "day",
    });
  });

  // Add Crew C (nights)
  crewCDays.forEach((work, dayIndex) => {
    pattern.push({
      dayIndex,
      crewIndex: 2,
      work: work === 1,
      shiftDefinitionKey: "night",
    });
  });

  // Add Crew D (nights)
  crewDDays.forEach((work, dayIndex) => {
    pattern.push({
      dayIndex,
      crewIndex: 3,
      work: work === 1,
      shiftDefinitionKey: "night",
    });
  });

  return pattern;
}

// Simple 4-crew rotating pattern
function generateSimple4CrewPattern(): PatternDay[] {
  const pattern: PatternDay[] = [];

  // Simple pattern: each crew works 2 days then 2 off
  for (let crewIndex = 0; crewIndex < 4; crewIndex++) {
    for (let dayIndex = 0; dayIndex < 8; dayIndex++) {
      const workDays = [crewIndex * 2, crewIndex * 2 + 1].map(d => d % 8);
      pattern.push({
        dayIndex,
        crewIndex,
        work: workDays.includes(dayIndex),
        shiftDefinitionKey: crewIndex < 2 ? "day" : "night",
      });
    }
  }

  return pattern;
}

export const PRESETS = {
  panama: {
    name: "Panama 2-2-3",
    description: "4 crews, 14-day cycle, 2-2-3-2-2-3 rotation pattern",
    cycleDays: 14,
    shiftLengthHours: 12,
    pattern: generatePanamaPattern(),
  },
  simple4crew: {
    name: "Simple 4-Crew",
    description: "4 crews, 8-day cycle, 2 on 2 off pattern",
    cycleDays: 8,
    shiftLengthHours: 12,
    pattern: generateSimple4CrewPattern(),
  },
};

export type PresetKey = keyof typeof PRESETS;

// Convert pattern to JSON string for storage
export function patternToJson(pattern: PatternDay[]): string {
  return JSON.stringify(pattern);
}

// Parse pattern from JSON
export function parsePattern(json: string): PatternDay[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
