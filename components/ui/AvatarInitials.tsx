interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarInitialsProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarInitials({
  name,
  size = "md",
  className = "",
}: AvatarInitialsProps) {
  return (
    <div
      aria-label={name}
      className={`inline-flex items-center justify-center rounded-full bg-hiro-green font-semibold text-white ${sizeClasses[size]} ${className}`.trim()}
    >
      {getInitials(name)}
    </div>
  );
}
