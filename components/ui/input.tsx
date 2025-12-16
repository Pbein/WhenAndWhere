import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f5] shadow-sm placeholder:text-[#a1a1aa] focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";










