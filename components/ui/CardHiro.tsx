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
      className={`rounded-2xl border p-5 transition-colors ${
        active
          ? "border-hiro-active bg-hiro-active text-white"
          : "border-black/8 bg-hiro-card text-hiro-text"
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
