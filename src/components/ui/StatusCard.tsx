import { Icon } from "@iconify/react";

interface StatusCardProps {
  icon: string;
  label: string;
  value: string;
  status: "hidden" | "public" | "encrypted";
}

export function StatusCard({ icon, label, value, status }: StatusCardProps) {
  const statusConfig = {
    hidden: {
      bg: "bg-success/10",
      text: "text-success",
      icon: "ph:eye-slash-fill",
      label: "Hidden",
    },
    public: {
      bg: "bg-warning/10",
      text: "text-warning",
      icon: "ph:eye-fill",
      label: "Public",
    },
    encrypted: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: "ph:lock-fill",
      label: "Encrypted",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon icon={icon} className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-mono text-sm">{value}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon icon={config.icon} className="w-3.5 h-3.5" />
        {config.label}
      </div>
    </div>
  );
}
