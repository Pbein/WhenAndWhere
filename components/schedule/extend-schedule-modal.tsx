"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Calendar, Loader2, Check, AlertCircle } from "lucide-react";

interface ExtendScheduleModalProps {
  missionId: Id<"zooMissions">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newEndDate: Date) => void;
}

const DURATION_OPTIONS = [
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
];

/**
 * Modal for extending the schedule generation for a mission.
 * Allows selecting a duration and shows a preview of what will be generated.
 */
export function ExtendScheduleModal({
  missionId,
  isOpen,
  onClose,
  onSuccess,
}: ExtendScheduleModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]);
  const [isExtending, setIsExtending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, []);

  // Clear timeout when modal closes externally
  useEffect(() => {
    if (!isOpen && autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  }, [isOpen]);

  const lastGeneratedDate = useQuery(
    api.schedules.getLastGeneratedDate,
    isOpen ? { missionId } : "skip"
  );

  const extendSchedule = useMutation(api.schedules.extendSchedule);

  const startDate = lastGeneratedDate
    ? new Date(lastGeneratedDate)
    : new Date();

  const endDate = addDays(startDate, selectedDuration.days);

  const handleExtend = async () => {
    setIsExtending(true);
    setResult(null);

    try {
      const response = await extendSchedule({
        missionId,
        endDate: endDate.getTime(),
      });

      setResult({ success: true, count: response.generated });

      // Auto-close after short delay on success (with cleanup ref)
      autoCloseTimeoutRef.current = setTimeout(() => {
        onSuccess?.(endDate);
        onClose();
        setResult(null);
        autoCloseTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to extend schedule",
      });
    } finally {
      setIsExtending(false);
    }
  };

  const handleClose = () => {
    if (!isExtending) {
      // Clear any pending auto-close timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
      setResult(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-[#f5f5f5]">Extend Schedule</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isExtending}
            className="p-1 rounded hover:bg-[#2a2a2a] text-[#a1a1aa] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current status */}
          <div className="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa] mb-1">Currently generated through</div>
            <div className="text-lg font-medium text-[#f5f5f5]">
              {lastGeneratedDate === undefined ? (
                <span className="animate-pulse">Loading...</span>
              ) : lastGeneratedDate ? (
                format(new Date(lastGeneratedDate), "MMMM d, yyyy")
              ) : (
                <span className="text-amber-400">No shifts generated yet</span>
              )}
            </div>
          </div>

          {/* Duration selection */}
          <div className="space-y-2">
            <label className="text-sm text-[#a1a1aa]">Extend by</label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setSelectedDuration(option)}
                  disabled={isExtending}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    selectedDuration.days === option.days
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-[#2a2a2a] bg-[#1a1a1a] text-[#a1a1aa] hover:text-[#f5f5f5] hover:border-[#3a3a3a]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
            <div className="text-xs text-[#a1a1aa] mb-1">Will generate through</div>
            <div className="text-lg font-medium text-[#f5f5f5]">
              {lastGeneratedDate === undefined ? (
                <span className="animate-pulse">Calculating...</span>
              ) : (
                format(endDate, "MMMM d, yyyy")
              )}
            </div>
            <div className="text-xs text-[#a1a1aa] mt-1">
              ~{selectedDuration.days * 2} shifts (Day + Night per day)
            </div>
          </div>

          {/* Result message */}
          {result && (
            <div
              className={cn(
                "p-3 rounded-lg border flex items-center gap-2",
                result.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}
            >
              {result.success ? (
                <>
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Generated {result.count} shifts successfully!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{result.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#2a2a2a]">
          <Button variant="outline" onClick={handleClose} disabled={isExtending}>
            Cancel
          </Button>
          <Button 
            onClick={handleExtend} 
            disabled={isExtending || result?.success || lastGeneratedDate === undefined}
          >
            {isExtending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Extend Schedule"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}