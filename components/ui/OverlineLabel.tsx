import type { ReactNode } from "react";

interface OverlineLabelProps {
  children: ReactNode;
  tone?: "default" | "muted" | "success";
  className?: string;
}

const toneClasses: Record<NonNullable<OverlineLabelProps["tone"]>, string> = {
  default: "text-hiro-text",
  muted: "text-hiro-muted",
  success: "text-hiro-green",
};

export function OverlineLabel({
  children,
  tone = "default",
  className = "",
}: OverlineLabelProps) {
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
