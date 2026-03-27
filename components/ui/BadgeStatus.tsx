interface BadgeStatusProps {
  label: string;
  status?: "default" | "ready" | "pending" | "danger" | "urgent";
  className?: string;
}

const statusClasses: Record<NonNullable<BadgeStatusProps["status"]>, string> = {
  default: "bg-hiro-badge-bg text-hiro-badge-fg",
  ready: "bg-hiro-badge-bg text-hiro-badge-fg",
  pending: "bg-hiro-amber/20 text-hiro-amber",
  danger: "bg-hiro-red/15 text-hiro-red",
  urgent: "bg-transparent text-hiro-red px-0 py-0",
};

export function BadgeStatus({
  label,
  status = "default",
  className = "",
}: BadgeStatusProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${statusClasses[status]} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
