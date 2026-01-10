import { Icon } from "@iconify/react";

interface PrivacyBadgeProps {
  icon?: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning";
}

export function PrivacyBadge({ icon = "ph:shield-check", children, variant = "default" }: PrivacyBadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${variants[variant]}`}>
      <Icon icon={icon} className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}
