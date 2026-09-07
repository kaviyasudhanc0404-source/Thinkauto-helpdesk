import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle2, Circle, ArrowRight, XCircle } from "lucide-react";

export type TicketStatus = "open" | "in_progress" | "resolved" | "unsolved" | "expired" | "urgent";
export type TicketPriority = "low" | "medium" | "high" | "critical";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaTime?: string;
  assignee?: string;
  createdAt: string;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  open: { icon: Circle, label: "Open", color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info)/.1)]" },
  in_progress: { icon: Clock, label: "In Progress", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/.1)]" },
  resolved: { icon: CheckCircle2, label: "Resolved", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/.1)]" },
  unsolved: { icon: XCircle, label: "Unsolved", color: "text-destructive", bg: "bg-destructive/10" },
  expired: { icon: XCircle, label: "Expired", color: "text-destructive", bg: "bg-destructive/10" },
  urgent: { icon: AlertTriangle, label: "Urgent", color: "text-destructive", bg: "bg-destructive/10" },
};

const priorityColors = {
  low: "bg-[hsl(var(--info)/.15)] text-[hsl(var(--info))]",
  medium: "bg-[hsl(var(--warning)/.15)] text-[hsl(var(--warning))]",
  high: "bg-primary/15 text-primary",
  critical: "bg-destructive/15 text-destructive",
};

const TicketCard = ({ id, title, description, status, priority, slaTime, assignee, createdAt, onClick, className = "" }: TicketCardProps) => {
  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`glass group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-4 transition-all hover:border-primary/30 sm:p-5 ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">#{id}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
        <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${statusConfig[status].bg} ${statusConfig[status].color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig[status].label}
        </div>
      </div>

      <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {slaTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {slaTime}
            </span>
          )}
          <span>{createdAt}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>

      {assignee && (
        <div className="mt-3 min-w-0 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Assigned to: </span>
          <span className="text-xs font-medium text-foreground">{assignee}</span>
        </div>
      )}
    </motion.div>
  );
};

export default TicketCard;
