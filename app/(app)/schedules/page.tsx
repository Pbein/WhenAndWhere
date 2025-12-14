"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, addDays } from "date-fns";

export default function SchedulesPage() {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const missions = useQuery(api.missions.listActive);
  
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const endDate = addDays(startDate, 13); // 2 weeks

  const shifts = useQuery(
    api.schedules.getShiftsForDateRange,
    selectedMission
      ? {
          missionId: selectedMission as any,
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
        }
      : "skip"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Schedules</h1>
          <p className="text-sm text-[#a1a1aa]">
            View and manage shift schedules by mission
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedMission ?? ""}
            onChange={(e) => setSelectedMission(e.target.value || null)}
            className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f5]"
          >
            <option value="">Select Mission</option>
            {missions?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <Button disabled={!selectedMission}>Generate Shifts</Button>
        </div>
      </div>

      {selectedMission && (
        <Card>
          <CardHeader>
            <CardTitle>
              Week View: {format(startDate, "MMM d")} - {format(endDate, "MMM d")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shifts && shifts.length > 0 ? (
              <div className="space-y-2">
                {shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="flex items-center justify-between rounded border border-[#2a2a2a] bg-[#111111] px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#f5f5f5]">
                        {format(new Date(shift.dateStart), "EEE MMM d")}
                      </div>
                      <div className="text-xs text-[#a1a1aa]">
                        {shift.assignments.length} assigned
                      </div>
                    </div>
                    <div className="text-sm text-[#a1a1aa]">{shift.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[#a1a1aa]">
                No shifts yet. Click "Generate Shifts" to create a schedule.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedMission && (
        <div className="text-center py-12">
          <p className="text-sm text-[#a1a1aa]">Select a mission to view schedules.</p>
        </div>
      )}
    </div>
  );
}
