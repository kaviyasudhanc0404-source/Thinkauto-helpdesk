import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Ticket } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { buildCategoryData, buildDailyVolume, getCurrentWeekTickets, getTicketSummary, tooltipStyle } from "@/lib/adminMetrics";

const Analytics = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    const [ticketResponse, userResponse] = await Promise.all([api.getTickets(), api.getUsers()]);
    if (ticketResponse.success) setTickets(ticketResponse.data.tickets);
    if (userResponse.success) setUsers(userResponse.data.users);
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const weeklyTickets = getCurrentWeekTickets(tickets);
  const summary = getTicketSummary(weeklyTickets);
  const weeklyVolume = buildDailyVolume(tickets);
  const categoryBreakdown = buildCategoryData(tickets);
  const resolutionRate = summary.total ? Math.round((summary.resolved / summary.total) * 100) : 0;
  const avgResponseHours = weeklyTickets.length
    ? Math.max(0.1, weeklyTickets.reduce((sum, ticket) => sum + (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000, 0) / weeklyTickets.length).toFixed(1)
    : "0";

  return (
    <DashboardLayout title="Analytics">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Ticket} label="This Week" value={summary.total} variant="primary" />
        <StatsCard icon={TrendingUp} label="Resolution Rate" value={`${resolutionRate}%`} variant="success" />
        <StatsCard icon={BarChart3} label="Avg Age" value={`${avgResponseHours}h`} variant="info" />
        <StatsCard icon={Users} label="Active Agents" value={users.filter((user) => user.role === "technician" && user.isActive).length} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Weekly Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyVolume}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(25, 12%, 50%)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="tickets" fill="hsl(25, 95%, 53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryBreakdown.map((c) => (
              <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
