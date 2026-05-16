import { cn } from "../../utils/cn";

interface StatusChipProps {
  status:
    | "placed"
    | "in_progress"
    | "done"
    | "shipped"
    | "cancelled"
    | "rejected"
    | "low"
    | "out"
    | "available";
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const statusConfig = {
    placed: { bg: "bg-info/10", text: "text-info", label: "Placed" },
    in_progress: {
      bg: "bg-warning/10",
      text: "text-warning",
      label: "In Progress",
    },
    done: { bg: "bg-success/10", text: "text-success", label: "Done" },
    shipped: { bg: "bg-primary/10", text: "text-primary", label: "Shipped" },
    cancelled: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      label: "Cancelled",
    },
    rejected: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Rejected",
    },
    low: { bg: "bg-warning/10", text: "text-warning", label: "Low Stock" },
    out: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Out of Stock",
    },
    available: {
      bg: "bg-success/10",
      text: "text-success",
      label: "Available",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold whitespace-nowrap",
        "px-2.5 py-0.5 text-xs",
        config.bg,
        config.text,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
