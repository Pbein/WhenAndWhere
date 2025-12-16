"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "emerald" | "amber" | "blue" | "red";

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  accent: Accent;
  children: ReactNode;
  className?: string;
}

const accentStyles: Record<Accent, string> = {
  emerald: "border-l-[#10b981]",
  amber: "border-l-[#f59e0b]",
  blue: "border-l-[#3b82f6]",
  red: "border-l-[#ef4444]",
};

const iconStyles: Record<Accent, string> = {
  emerald: "text-[#10b981]",
  amber: "text-[#f59e0b]",
  blue: "text-[#3b82f6]",
  red: "text-[#ef4444]",
};

/**
 * Metric card for displaying key dashboard statistics
 */
export function MetricCard({
  title,
  icon: Icon,
  accent,
  children,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("border-l-4", accentStyles[accent], className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-[#a1a1aa]">
          <Icon className={cn("h-4 w-4", iconStyles[accent])} />
          <span className="text-sm">{title}</span>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}



