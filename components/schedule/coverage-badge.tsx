"use client";

import { cn } from "@/lib/utils";
import { COVERAGE_COLORS } from "@/lib/constants";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export type CoverageStatus = "green" | "yellow" | "red";

interface CoverageBadgeProps {
  status: CoverageStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  tooltip?: string;
  className?: string;
}

const statusConfig = {
  green: {
    icon: CheckCircle,
    label: "Covered",
    ariaLabel: "Fully covered",
  },
  yellow: {
    icon: AlertCircle,
    label: "Partial",
    ariaLabel: "Partially covered",
  },
  red: {
    icon: XCircle,
    label: "Gap",
    ariaLabel: "Coverage gap",
  },
} as const;

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
} as const;

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 16,
} as const;

/**
 * Visual indicator for shift coverage status (green/yellow/red)
 */
export function CoverageBadge({
  status,
  size = "sm",
  showLabel = false,
  tooltip,
  className,
}: CoverageBadgeProps) {
  const config = statusConfig[status];
  const colors = COVERAGE_COLORS[status];
  const Icon = config.icon;

  const badge = (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={config.ariaLabel}
      title={tooltip}
    >
      {size === "sm" ? (
        <span
          className={cn("rounded-full", sizeClasses[size])}
          style={{ backgroundColor: colors.bg }}
        />
      ) : (
        <Icon
          size={iconSizes[size]}
          style={{ color: colors.bg }}
          className="flex-shrink-0"
        />
      )}
      {showLabel && (
        <span className="text-xs text-[#a1a1aa]">{config.label}</span>
      )}
    </span>
  );

  return badge;
}




