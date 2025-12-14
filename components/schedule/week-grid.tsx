import { format, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ShiftDisplay = {
  id: string;
  date: string; // ISO date string
  mission: string;
  team?: string;
  shiftType: "Day" | "Night";
  primary?: string;
  backup?: string;
  status?: "DRAFT" | "FINAL";
  ptoConflict?: boolean;
};

type Props = {
  start: Date;
  days?: number;
  shifts: ShiftDisplay[];
};

export function WeekGrid({ start, days = 7, shifts }: Props) {
  const dayList = Array.from({ length: days }, (_, i) => addDays(start, i));
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))] border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
        <div className="px-3 py-2">Team</div>
        {dayList.map((d) => (
          <div key={d.toISOString()} className="px-3 py-2 text-center">
            {format(d, "EEE dd MMM")}
          </div>
        ))}
      </div>
      <div className="divide-y divide-gray-200 text-sm text-gray-900">
        {["A", "B", "C"].map((team) => (
          <div
            key={team}
            className="grid grid-cols-[160px_repeat(auto-fit,minmax(140px,1fr))]"
          >
            <div className="border-r border-gray-200 px-3 py-2 font-semibold">
              Crew {team}
            </div>
            {dayList.map((d) => {
              const dayKey = format(d, "yyyy-MM-dd");
              const shift = shifts.find(
                (s) => s.team === `Crew ${team}` && s.date.startsWith(dayKey),
              );
              return (
                <div
                  key={dayKey + team}
                  className={cn(
                    "min-h-[88px] border-r border-gray-200 px-3 py-2",
                    shift ? "bg-blue-50" : "bg-white",
                  )}
                >
                  {shift ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                        <span>{shift.mission}</span>
                        <Badge tone={shift.shiftType === "Day" ? "blue" : "amber"}>
                          {shift.shiftType}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Primary: {shift.primary ?? "Unassigned"}
                      </div>
                      <div className="text-xs text-gray-700">
                        Backup: {shift.backup ?? "Unassigned"}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-600">
                        <Badge tone={shift.status === "FINAL" ? "green" : "gray"}>
                          {shift.status ?? "DRAFT"}
                        </Badge>
                        {shift.ptoConflict ? (
                          <Badge tone="red">PTO conflict</Badge>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No shift</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}







