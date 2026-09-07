import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import TicketCard from "@/components/TicketCard";
import { motion } from "framer-motion";
import { Plus, ListTodo, Clock, Ticket, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isResolvedStatus, isTerminalTicketStatus, toTicketCardStatus } from "@/lib/ticketStatus";

const quickActions = [
  { icon: Plus, label: "Raise Ticket", desc: "Create a new support ticket", path: "/employee/raise-ticket", gradient: true },
  { icon: ListTodo, label: "My Tickets", desc: "View all your tickets", path: "/employee/my-tickets", gradient: false },
];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  // Fetch employee's tickets and user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current user info
        const userResponse = await api.getMe();
        if (userResponse.success && userResponse.data?.user) {
          setUserName(userResponse.data.user.name || "User");
        }

        // Fetch employee's tickets (backend already filters by createdBy)
        const ticketsResponse = await api.getTickets();
        if (ticketsResponse.success && ticketsResponse.data?.tickets) {
          setTickets(ticketsResponse.data.tickets);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate real-time stats from tickets
  const calculateStats = () => {
    const totalTickets = tickets.length;
    const pendingCount = tickets.filter((t) => !isTerminalTicketStatus(t)).length;
    const resolvedCount = tickets.filter((t) => isResolvedStatus(t)).length;
    const urgentCount = tickets.filter(
      (t) => t.priority === "Critical" || t.priority === "High"
    ).length;

    return { totalTickets, pendingCount, resolvedCount, urgentCount };
  };

  const stats = calculateStats();

  // Format timestamp for display
  const formatTimestamp = (date) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  // Convert tickets to TicketCard format (show recent 6)
  const recentTickets = tickets.slice(0, 6).map((ticket) => ({
    id: ticket.ticketNumber || ticket._id,
    title: ticket.title,
    description: ticket.description,
    status: toTicketCardStatus(ticket),
    priority: ticket.priority.toLowerCase() as "low" | "medium" | "high" | "critical",
    createdAt: formatTimestamp(ticket.createdAt),
  }));

  return (
    <DashboardLayout title={`Welcome back, ${userName}! 👋`}>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(action.path)}
            className={`p-5 rounded-2xl text-left transition-all group ${
              action.gradient
                ? "gradient-primary text-primary-foreground glow-orange hover:opacity-90"
                : "glass hover:border-primary/30"
            }`}
          >
            <action.icon className={`w-6 h-6 mb-3 ${action.gradient ? "" : "text-primary"}`} />
            <p className="font-display font-semibold">{action.label}</p>
            <p className={`text-sm mt-1 ${action.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {action.desc}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Stats - Real Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Ticket}
          label="Total Tickets"
          value={loading ? "..." : stats.totalTickets}
          variant="primary"
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={loading ? "..." : stats.pendingCount}
          variant="warning"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Resolved"
          value={loading ? "..." : stats.resolvedCount}
          variant="success"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Urgent"
          value={loading ? "..." : stats.urgentCount}
          variant="info"
        />
      </div>

      {/* Recent Tickets - Real Data */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">Recent Tickets</h2>
        <button
          onClick={() => navigate("/employee/my-tickets")}
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      ) : recentTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any tickets yet</p>
          <button
            onClick={() => navigate("/employee/raise-ticket")}
            className="gradient-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl glow-orange hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Ticket
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
