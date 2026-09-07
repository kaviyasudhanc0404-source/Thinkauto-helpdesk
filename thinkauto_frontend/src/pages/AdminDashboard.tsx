import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { BarChart3, Users, Ticket, Clock, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { buildCategoryData, buildDailyVolume, buildTeamPerformance, getSlaInfo, getTicketSummary, tooltipStyle } from "@/lib/adminMetrics";
import { useToast } from "@/hooks/use-toast";
import { isTerminalTicketStatus } from "@/lib/ticketStatus";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdminData = async (showError = false) => {
    try {
      const [ticketResponse, userResponse] = await Promise.all([api.getTickets(), api.getUsers()]);
      if (ticketResponse.success) setTickets(ticketResponse.data.tickets);
      if (userResponse.success) setUsers(userResponse.data.users);
    } catch (error) {
      if (showError) {
        toast({ title: "Admin data unavailable", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(true);
    const timer = window.setInterval(() => fetchAdminData(), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = getTicketSummary(tickets);
  const dailyData = buildDailyVolume(tickets);
  const categoryData = buildCategoryData(tickets);
  const teamMembers = buildTeamPerformance(users, tickets).slice(0, 5);
  const activeTickets = tickets.filter((ticket) => !isTerminalTicketStatus(ticket));
  const avgResolutionHours = tickets
    .filter((ticket) => ticket.resolution?.resolvedAt)
    .map((ticket) => (new Date(ticket.resolution.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / 3600000);
  const avgResolution = avgResolutionHours.length
    ? `${(avgResolutionHours.reduce((sum, value) => sum + value, 0) / avgResolutionHours.length).toFixed(1)}h`
    : "0h";

  return (
    <DashboardLayout title="Command Center">
      <div className="mb-4 flex justify-end text-xs text-muted-foreground">
        {loading ? "Syncing live admin data..." : `Live: ${tickets.length} tickets, ${users.length} users`}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Ticket} label="Total Tickets" value={summary.total} variant="primary" />
        <StatsCard icon={CheckCircle2} label="Resolved" value={summary.resolved} variant="success" />
        <StatsCard icon={Clock} label="Avg Resolution" value={avgResolution} variant="info" />
        <StatsCard icon={Shield} label="SLA Compliance" value={`${summary.slaRate}%`} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Ticket Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="tickets" fill="hsl(25, 95%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Resolution Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="created" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Team Performance</h3>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {teamMembers.map((member, i) => (
              <motion.div key={member._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary/30 p-3 sm:flex-nowrap sm:gap-4">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  {(member.name || member.username).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name || member.username}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))]" /> {member.resolved}</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-[hsl(var(--warning))]" /> {member.pending}</span>
                    <span>Rating {member.rating}</span>
                  </div>
                </div>
                <div className="ml-12 w-[calc(100%-3rem)] sm:ml-0 sm:w-20">
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="gradient-primary rounded-full h-1.5" style={{ width: `${Math.min(100, (member.resolved / Math.max(1, member.assigned || 1)) * 100)}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
            {!teamMembers.length && <p className="text-sm text-muted-foreground">No technicians found.</p>}
          </div>
        </motion.div>
      </div>

      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> System Alerts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { text: `${summary.atRisk} active tickets approaching SLA breach`, type: summary.atRisk ? "warning" : "info" },
          { text: `${users.filter((user) => user.role === "employee" && user.isActive).length} active employees in helpdesk`, type: "info" },
          { text: `${activeTickets.filter((ticket) => !ticket.assignedTo).length} tickets waiting for assignment`, type: "warning" },
        ].map((alert, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`glass rounded-xl p-4 border-l-4 ${alert.type === "warning" ? "border-l-[hsl(var(--warning))]" : "border-l-[hsl(var(--info))]"}`}>
            <p className="text-sm text-foreground">{alert.text}</p>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
