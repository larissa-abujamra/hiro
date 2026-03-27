import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonHiroProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses: Record<NonNullable<ButtonHiroProps["variant"]>, string> = {
  primary: "bg-hiro-text text-white hover:brightness-110",
  secondary:
    "border border-black/15 bg-transparent text-hiro-text hover:bg-black/5",
  ghost: "bg-transparent text-hiro-text hover:bg-hiro-card/70",
  danger: "bg-hiro-red text-white hover:brightness-110",
};

export function ButtonHiro({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHiroProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
