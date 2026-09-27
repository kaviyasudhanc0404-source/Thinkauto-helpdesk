import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import TicketCard from "@/components/TicketCard";
import { motion } from "framer-motion";
import { Inbox, Clock, CheckCircle2, TrendingUp, Zap, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { isResolvedStatus, isTerminalTicketStatus, toTicketCardStatus } from "@/lib/ticketStatus";

const TechnicianDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Technician");

  // Fetch technician's assigned tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current user info
        const userResponse = await api.getMe();
        if (userResponse.success && userResponse.data?.user) {
          setUserName(userResponse.data.user.name || "Technician");
        }

        // Fetch tickets assigned to technician (backend filters automatically)
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

  // Calculate real-time stats
  const calculateStats = () => {
    // Filter only tickets assigned to this technician (exclude unassigned ones)
    const myTickets = tickets.filter((t) => t.assignedTo?._id);

    const assignedCount = myTickets.length;
    const slaAtRisk = myTickets.filter((t) => {
      if (isTerminalTicketStatus(t)) return false;

      // Calculate time elapsed since creation
      const createdDate = new Date(t.createdAt);
      const now = new Date();
      const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      // SLA thresholds by priority
      const slaThresholds = {
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48,
      };

      const threshold = slaThresholds[t.priority] || 24;
      return hoursElapsed > threshold * 0.8; // At risk if 80% of SLA time elapsed
    }).length;

    // Count tickets resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedToday = myTickets.filter((t) => {
      if (!isResolvedStatus(t)) return false;
      const resolvedDate = new Date(t.updatedAt);
      return resolvedDate >= today;
    }).length;

    // Calculate average resolution time (in hours)
    const resolvedTickets = myTickets.filter(
      (t) => isResolvedStatus(t)
    );
    let avgResolution = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.updatedAt);
        const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolution = totalHours / resolvedTickets.length;
    }

    return { assignedCount, slaAtRisk, resolvedToday, avgResolution };
  };

  // Calculate this week's performance
  const calculateWeeklyPerformance = () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const myTickets = tickets.filter((t) => t.assignedTo?._id);
    const resolvedThisWeek = myTickets.filter((t) => {
      if (!isResolvedStatus(t)) return false;
      const resolvedDate = new Date(t.updatedAt);
      return resolvedDate >= startOfWeek;
    }).length;

    // Estimate target as resolved + pending (rough target)
    const target = Math.max(resolvedThisWeek + 2, 20);

    return { resolved: resolvedThisWeek, target };
  };

  // Calculate SLA compliance
  const calculateSLACompliance = () => {
    const myTickets = tickets.filter((t) => t.assignedTo?._id);
    if (myTickets.length === 0) return { compliance: 100, target: 95 };

    const resolvedTickets = myTickets.filter(
      (t) => isResolvedStatus(t)
    );
    if (resolvedTickets.length === 0) return { compliance: 100, target: 95 };

    const withinSLA = resolvedTickets.filter((t) => {
      const createdDate = new Date(t.createdAt);
      const resolvedDate = new Date(t.updatedAt);
      const hoursElapsed = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      const slaThresholds = {
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48,
      };

      const threshold = slaThresholds[t.priority] || 24;
      return hoursElapsed <= threshold;
    }).length;

    const compliance = Math.round((withinSLA / resolvedTickets.length) * 100);
    return { compliance, target: 95 };
  };

  // Calculate customer rating (based on resolved tickets with high priority resolved quickly)
  const calculateCustomerRating = () => {
    const myTickets = tickets.filter((t) => t.assignedTo?._id);
    const resolvedTickets = myTickets.filter(
      (t) => isResolvedStatus(t)
    );

    if (resolvedTickets.length === 0) return { rating: 5.0, target: 5 };

    // Simple calculation: faster resolution = higher rating
    let totalRating = 0;
    resolvedTickets.forEach((t) => {
      const createdDate = new Date(t.createdAt);
      const resolvedDate = new Date(t.updatedAt);
      const hoursElapsed = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      const slaThresholds = {
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48,
      };

      const threshold = slaThresholds[t.priority] || 24;
      const ratio = hoursElapsed / threshold;

      // Rating: 5 if resolved in <50% SLA time, down to 3 if at SLA limit
      let rating = 5;
      if (ratio > 0.5 && ratio <= 0.75) rating = 4.5;
      else if (ratio > 0.75 && ratio <= 1) rating = 4;
      else if (ratio > 1) rating = 3.5;

      totalRating += rating;
    });

    const avgRating = totalRating / resolvedTickets.length;
    return { rating: parseFloat(avgRating.toFixed(1)), target: 5 };
  };

  // Find most urgent SLA at-risk ticket
  const getMostUrgentTicket = () => {
    const myTickets = tickets.filter(
      (t) => t.assignedTo?._id && !isTerminalTicketStatus(t)
    );

    if (myTickets.length === 0) return null;

    // Calculate time remaining for each ticket
    const ticketsWithSLA = myTickets.map((t) => {
      const createdDate = new Date(t.createdAt);
      const now = new Date();
      const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

      const slaThresholds = {
        Critical: 4,
        High: 8,
        Medium: 24,
        Low: 48,
      };

      const threshold = slaThresholds[t.priority] || 24;
      const hoursRemaining = threshold - hoursElapsed;

      return { ...t, hoursRemaining, threshold };
    });

    // Sort by time remaining (ascending) and return the most urgent
    ticketsWithSLA.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
    const mostUrgent = ticketsWithSLA[0];

    // Only show alert if less than 2 hours remaining
    if (mostUrgent.hoursRemaining < 2) {
      return mostUrgent;
    }

    return null;
  };

  // Format timestamp
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

  // Convert tickets to TicketCard format
  const assignedTickets = tickets
    .filter((t) => t.assignedTo?._id) // Only show assigned tickets
    .filter((t) => !isTerminalTicketStatus(t)) // Only active tickets
    .map((ticket) => ({
      id: ticket.ticketNumber || ticket._id,
      title: ticket.title,
      description: ticket.description,
      status: toTicketCardStatus(ticket),
      priority: ticket.priority.toLowerCase() as "low" | "medium" | "high" | "critical",
      createdAt: formatTimestamp(ticket.createdAt),
    }));

  const stats = calculateStats();
  const weeklyPerf = calculateWeeklyPerformance();
  const slaCompliance = calculateSLACompliance();
  const customerRating = calculateCustomerRating();
  const urgentTicket = getMostUrgentTicket();
  return (
    <DashboardLayout title={`Welcome, ${userName}!`}>
      {/* Stats - Real Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Inbox}
          label="Assigned"
          value={loading ? "..." : stats.assignedCount}
          variant="primary"
        />
        <StatsCard
          icon={Timer}
          label="SLA At Risk"
          value={loading ? "..." : stats.slaAtRisk}
          variant="warning"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Resolved Today"
          value={loading ? "..." : stats.resolvedToday}
          variant="success"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Resolution"
          value={loading ? "..." : `${stats.avgResolution.toFixed(1)}h`}
          variant="info"
        />
      </div>

      {/* SLA Alert - Real Data */}
      {!loading && urgentTicket && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass mb-8 flex flex-col items-stretch gap-4 rounded-2xl border-destructive/30 p-4 sm:flex-row sm:items-center sm:p-5"
        >
          <div className="bg-destructive/15 rounded-xl p-3">
            <Zap className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">SLA Alert</p>
            <p className="text-sm text-muted-foreground">
              Ticket #{urgentTicket.ticketNumber} is approaching SLA breach in{" "}
              {Math.floor(urgentTicket.hoursRemaining * 60)} minutes
            </p>
          </div>
          <button
            onClick={() => navigate(`/technician/assigned-tickets`)}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            Take Action
          </button>
        </motion.div>
      )}

      {/* Performance - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass rounded-2xl p-5"
        >
          <p className="text-sm text-muted-foreground mb-2">This Week</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-display font-bold text-foreground">
              {loading ? "..." : weeklyPerf.resolved}
            </span>
            <span className="text-xs text-muted-foreground mb-1">
              / {loading ? "..." : weeklyPerf.target}
            </span>
          </div>
          {!loading && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="gradient-primary rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${Math.min((weeklyPerf.resolved / weeklyPerf.target) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5"
        >
          <p className="text-sm text-muted-foreground mb-2">SLA Compliance</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-display font-bold text-foreground">
              {loading ? "..." : `${slaCompliance.compliance}%`}
            </span>
            <span className="text-xs text-muted-foreground mb-1">
              / {slaCompliance.target}%
            </span>
          </div>
          {!loading && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="gradient-primary rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${Math.min((slaCompliance.compliance / slaCompliance.target) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <p className="text-sm text-muted-foreground mb-2">Performance Score</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-display font-bold text-foreground">
              {loading ? "..." : `${customerRating.rating}/5`}
            </span>
          </div>
          {!loading && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="gradient-primary rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${(customerRating.rating / customerRating.target) * 100}%`,
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Assigned Tickets - Real Data */}
      <h2 className="text-lg font-display font-semibold text-foreground mb-4">
        Assigned Tickets ({loading ? "..." : assignedTickets.length})
      </h2>

      {loading ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      ) : assignedTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedTickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-2">
            No active tickets assigned to you at the moment
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for new assignments
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
