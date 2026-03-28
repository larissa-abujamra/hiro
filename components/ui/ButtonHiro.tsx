import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonHiroProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses: Record<NonNullable<ButtonHiroProps["variant"]>, string> = {
  primary:
    "bg-hiro-text text-white transition-all duration-200 ease-out hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(28,43,30,0.2)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/40 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-bg",
  secondary:
    "border border-black/15 bg-transparent text-hiro-text transition-all duration-200 hover:bg-black/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/35 focus-visible:ring-offset-2 focus-visible:ring-offset-hiro-bg",
  ghost:
    "bg-transparent text-hiro-text transition-colors duration-150 hover:bg-hiro-card/70 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-active/30 focus-visible:ring-offset-2",
  danger:
    "bg-hiro-red text-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(217,79,79,0.25)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hiro-red/50 focus-visible:ring-offset-2",
};

export function ButtonHiro({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHiroProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center rounded-full px-7 py-3 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
