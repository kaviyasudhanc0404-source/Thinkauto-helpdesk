import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { buildTeamPerformance } from "@/lib/adminMetrics";

const Team = () => {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  const fetchData = async () => {
    const [userResponse, ticketResponse] = await Promise.all([api.getUsers({ role: "technician" }), api.getTickets()]);
    if (userResponse.success) setUsers(userResponse.data.users);
    if (ticketResponse.success) setTickets(ticketResponse.data.tickets);
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const teamMembers = buildTeamPerformance(users, tickets);

  return (
    <DashboardLayout title="Team Management">
      <div className="flex justify-end mb-4">
        <button onClick={fetchData} className="glass px-3 py-2 rounded-xl text-sm text-foreground flex items-center gap-2 hover:border-primary/30">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
      <div className="space-y-3">
        {teamMembers.map((member, i) => (
          <motion.div key={member._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
              {(member.name || member.username).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-foreground">{member.name || member.username}</p>
              <p className="text-xs text-muted-foreground">{member.department || "General"} technician</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--success))]" /> {member.resolved}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--warning))]" /> {member.pending}</span>
              <span className="text-muted-foreground">Rating {member.rating}</span>
            </div>
            <div className="w-24 hidden sm:block">
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="gradient-primary rounded-full h-1.5" style={{ width: `${Math.min(100, (member.resolved / Math.max(1, member.assigned || 1)) * 100)}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
        {!teamMembers.length && <div className="glass rounded-xl p-8 text-center text-muted-foreground">No technicians found.</div>}
      </div>
    </DashboardLayout>
  );
};

export default Team;
