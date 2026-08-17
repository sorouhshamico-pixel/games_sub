import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

// Exported so consumers that need a motion-enabled button (apps/web's
// MotionButton) can build their own `motion.button` with these exact
// classes instead of duplicating them — one source of truth for the visual
// language, even though the animated variant can't just wrap this
// component (motion needs a ref on the real DOM node).
export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:brightness-110 focus-visible:outline-brand-primary",
  secondary: "bg-brand-secondary text-white hover:brightness-110 focus-visible:outline-brand-secondary",
  ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]",
  danger: "bg-danger text-white hover:brightness-110 focus-visible:outline-danger",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-6 text-lg",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonBaseClasses, buttonVariantClasses[variant], buttonSizeClasses[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
