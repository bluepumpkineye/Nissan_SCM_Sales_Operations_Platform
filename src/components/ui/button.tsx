import * as React from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "default" | "outline" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[#C3002F] text-white hover:bg-[#a00027] border border-[#C3002F] shadow-[0_0_20px_rgba(195,0,47,0.25)]",
  outline: "border border-white/70 text-white hover:bg-white/10",
  ghost: "border border-transparent text-[#F5F5F5] hover:bg-white/10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";