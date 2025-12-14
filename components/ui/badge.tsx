import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "red" | "amber" | "gray" | "blue";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  green: "bg-[#10b981] text-white",
  red: "bg-[#ef4444] text-white",
  amber: "bg-[#f59e0b] text-white",
  gray: "bg-[#2a2a2a] text-[#a1a1aa]",
  blue: "bg-[#3b82f6] text-white",
};

export function Badge({ className, tone = "gray", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}







