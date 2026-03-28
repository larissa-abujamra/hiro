import type { ReactNode } from "react";

interface OverlineLabelProps {
  children: ReactNode;
  tone?: "default" | "muted" | "success";
  className?: string;
}

const toneClasses: Record<NonNullable<OverlineLabelProps["tone"]>, string> = {
  default: "text-hiro-muted",
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
      className={`text-[11px] font-medium tracking-[0.06em] ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
