import type { HTMLAttributes, ReactNode } from "react";

interface CardHiroProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
}

export function CardHiro({
  children,
  active = false,
  className = "",
  ...props
}: CardHiroProps) {
  return (
    <div
      className={`rounded-2xl p-5 transition-colors ${
        active
          ? "glass-card-active border border-white/15 text-white"
          : "glass-card text-hiro-text"
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
