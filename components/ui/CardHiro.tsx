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
          ? "border border-hiro-active bg-hiro-active text-white"
          : "glass-card text-hiro-text"
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
