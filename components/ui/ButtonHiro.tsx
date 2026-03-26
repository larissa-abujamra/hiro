import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonHiroProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses: Record<NonNullable<ButtonHiroProps["variant"]>, string> = {
  primary: "bg-hiro-green text-white hover:brightness-110",
  secondary: "bg-hiro-card text-hiro-text hover:bg-hiro-card/80",
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
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
