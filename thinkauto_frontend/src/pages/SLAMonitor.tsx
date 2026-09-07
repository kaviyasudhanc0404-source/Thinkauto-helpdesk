import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";
import { getSlaInfo, getTicketSummary } from "@/lib/adminMetrics";
import { isTerminalTicketStatus } from "@/lib/ticketStatus";

const riskColors: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  warning: "border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5",
  safe: "border-l-[hsl(var(--success))] bg-[hsl(var(--success))]/5",
};

const SLAMonitor = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const response = await api.getTickets();
    if (response.success) setTickets(response.data.tickets);
  };

  useEffect(() => {
    fetchTickets();
    const timer = window.setInterval(fetchTickets, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = getTicketSummary(tickets);
  const activeTickets = tickets
    .filter((ticket) => !isTerminalTicketStatus(ticket))
    .map((ticket) => ({ ...ticket, slaInfo: getSlaInfo(ticket) }))
    .sort((a, b) => a.slaInfo.minutesRemaining - b.slaInfo.minutesRemaining);

  return (
    <DashboardLayout title="SLA Monitor">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Shield} label="Compliance" value={`${summary.slaRate}%`} variant="primary" />
        <StatsCard icon={AlertTriangle} label="At Risk" value={summary.atRisk} variant="warning" />
        <StatsCard icon={CheckCircle2} label="Met SLA" value={summary.total - summary.breached} variant="success" />
        <StatsCard icon={Clock} label="Active Tickets" value={summary.active} variant="info" />
      </div>

      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" /> Active SLA Tracking
      </h3>
      <div className="space-y-3">
        {activeTickets.map((ticket, i) => (
          <motion.div key={ticket._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`glass flex flex-col items-start gap-3 rounded-xl border-l-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${riskColors[ticket.slaInfo.risk]}`}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">#{ticket.ticketNumber || ticket._id.slice(-6)} - {ticket.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Time remaining: {ticket.slaInfo.label}</p>
            </div>
            <span className={`shrink-0 text-xs font-medium capitalize px-2.5 py-1 rounded-lg ${
              ticket.slaInfo.risk === "critical" ? "bg-destructive/15 text-destructive" :
              ticket.slaInfo.risk === "warning" ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" :
              "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
            }`}>
              {ticket.slaInfo.risk}
            </span>
          </motion.div>
        ))}
        {!activeTickets.length && <div className="glass rounded-xl p-8 text-center text-muted-foreground">No active SLA items.</div>}
      </div>
    </DashboardLayout>
  );
};

export default SLAMonitor;
