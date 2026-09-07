import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, CheckCircle2, Download } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { buildDailyVolume, getTicketSummary, tooltipStyle } from "@/lib/adminMetrics";
import { getEffectiveTicketStatus } from "@/lib/ticketStatus";

const Reports = () => {
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
  const reportData = buildDailyVolume(tickets);
  const avgResolutionHours = tickets
    .filter((ticket) => ticket.resolution?.resolvedAt)
    .map((ticket) => (new Date(ticket.resolution.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / 3600000);
  const avgResolution = avgResolutionHours.length
    ? `${(avgResolutionHours.reduce((sum, value) => sum + value, 0) / avgResolutionHours.length).toFixed(1)}h`
    : "0h";

  const exportReport = () => {
    const rows = [
      ["Ticket", "Title", "Category", "Priority", "Status", "Created By", "Assigned To", "Created At"],
      ...tickets.map((ticket) => [
        ticket.ticketNumber || ticket._id,
        ticket.title,
        ticket.category,
        ticket.priority,
        getEffectiveTicketStatus(ticket),
        ticket.createdBy?.name || "",
        ticket.assignedTo?.name || "",
        new Date(ticket.createdAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `thinkauto-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Reports">
      <div className="flex justify-end mb-4">
        <button onClick={exportReport} className="glass flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground hover:border-primary/30 sm:w-auto">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={BarChart3} label="Total Tickets" value={summary.total} variant="primary" />
        <StatsCard icon={CheckCircle2} label="Resolved" value={summary.resolved} variant="success" />
        <StatsCard icon={Clock} label="Avg Resolution" value={avgResolution} variant="info" />
        <StatsCard icon={TrendingUp} label="SLA Rate" value={`${summary.slaRate}%`} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Created vs Resolved</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reportData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="created" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Volume by Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reportData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="tickets" fill="hsl(25, 95%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
