import * as React from "react";
import { cn } from "../../utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 rounded-md border border-white/20 bg-[#111421] px-3 text-sm text-white outline-none ring-0 transition focus:border-[#C3002F]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}