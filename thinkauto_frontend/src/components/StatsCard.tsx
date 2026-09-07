import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning" | "info";
  children?: ReactNode;
}

const StatsCard = ({ icon: Icon, label, value, trend, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "glass",
    primary: "glass glow-orange border-primary/30",
    success: "glass border-[hsl(var(--success)/.3)]",
    warning: "glass border-[hsl(var(--warning)/.3)]",
    info: "glass border-[hsl(var(--info)/.3)]",
  };

  const iconBg = {
    default: "bg-secondary",
    primary: "gradient-primary",
    success: "bg-[hsl(var(--success)/.15)]",
    warning: "bg-[hsl(var(--warning)/.15)]",
    info: "bg-[hsl(var(--info)/.15)]",
  };

  const iconColor = {
    default: "text-muted-foreground",
    primary: "text-primary-foreground",
    success: "text-[hsl(var(--success))]",
    warning: "text-[hsl(var(--warning))]",
    info: "text-[hsl(var(--info))]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`${variantStyles[variant]} min-w-0 rounded-2xl p-3 transition-all sm:p-5`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className={`${iconBg[variant]} rounded-xl p-2 sm:p-2.5`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor[variant]}`} />
        </div>
        {trend && (
          <span className="max-w-full truncate rounded-full bg-[hsl(var(--success)/.1)] px-2 py-1 text-[10px] font-medium text-[hsl(var(--success))] sm:text-xs">
            {trend}
          </span>
        )}
      </div>
      <p className="break-words font-display text-xl font-bold text-foreground sm:text-2xl">{value}</p>
      <p className="mt-1 break-words text-xs text-muted-foreground sm:text-sm">{label}</p>
    </motion.div>
  );
};

export default StatsCard;
