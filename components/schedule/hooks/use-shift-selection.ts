"use client";

import { useState, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface UseShiftSelectionReturn {
  selectedShiftId: Id<"shiftInstances"> | null;
  isPanelOpen: boolean;
  selectShift: (shiftId: Id<"shiftInstances">) => void;
  clearSelection: () => void;
  togglePanel: () => void;
}

/**
 * Hook for managing shift selection state
 */
export function useShiftSelection(): UseShiftSelectionReturn {
  const [selectedShiftId, setSelectedShiftId] = useState<Id<"shiftInstances"> | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const selectShift = useCallback((shiftId: Id<"shiftInstances">) => {
    setSelectedShiftId(shiftId);
    setIsPanelOpen(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedShiftId(null);
    setIsPanelOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  return {
    selectedShiftId,
    isPanelOpen,
    selectShift,
    clearSelection,
    togglePanel,
  };
}




