import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f5] shadow-sm focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";











