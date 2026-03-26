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
      className={`rounded-2xl border p-5 shadow-sm transition-colors ${
        active
          ? "border-hiro-card-active bg-hiro-card-active text-white"
          : "border-hiro-card bg-hiro-card text-hiro-text"
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
