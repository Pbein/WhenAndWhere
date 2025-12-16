"use client";

import { cn } from "@/lib/utils";

export type ShiftState = "off" | "day" | "night";

interface PatternCellProps {
  state: ShiftState;
  onClick: () => void;
  disabled?: boolean;
}

export function PatternCell({ state, onClick, disabled }: PatternCellProps) {
  const config = {
    off: {
      bg: "bg-[#2a2a2a]",
      label: "",
      hover: "hover:bg-[#3a3a3a]",
    },
    day: {
      bg: "bg-amber-500",
      label: "D",
      hover: "hover:bg-amber-400",
    },
    night: {
      bg: "bg-indigo-500",
      label: "N",
      hover: "hover:bg-indigo-400",
    },
  }[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-10 rounded flex items-center justify-center",
        "text-sm font-medium text-white",
        "transition-all duration-150",
        config.bg,
        !disabled && config.hover,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {config.label}
    </button>
  );
}



