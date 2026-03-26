interface BadgeStatusProps {
  label: string;
  status?: "default" | "ready" | "pending" | "danger";
  className?: string;
}

const statusClasses: Record<NonNullable<BadgeStatusProps["status"]>, string> = {
  default: "bg-hiro-badge-bg text-hiro-badge-fg",
  ready: "bg-hiro-badge-bg text-hiro-badge-fg",
  pending: "bg-hiro-amber/20 text-hiro-amber",
  danger: "bg-hiro-red/15 text-hiro-red",
};

export function BadgeStatus({
  label,
  status = "default",
  className = "",
}: BadgeStatusProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status]} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
