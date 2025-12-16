import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  accent?: "emerald" | "blue" | "amber" | "none";
};

export function Card({
  className,
  children,
  accent = "none",
  ...props
}: CardProps) {
  const accentStyles = {
    emerald: "border-l-2 border-l-[#10b981]",
    blue: "border-l-2 border-l-[#3b82f6]",
    amber: "border-l-2 border-l-[#f59e0b]",
    none: "",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] shadow-sm",
        accentStyles[accent],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between px-4 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-[#f5f5f5]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 pb-4", className)} {...props}>
      {children}
    </div>
  );
}










