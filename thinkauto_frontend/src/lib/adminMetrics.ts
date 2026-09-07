import { isResolvedStatus, isTerminalTicketStatus, isUnsolvedStatus, toTicketCardStatus } from "./ticketStatus";

export const categoryColors = {
  Network: "hsl(25, 95%, 53%)",
  Hardware: "hsl(38, 92%, 55%)",
  Software: "hsl(210, 90%, 55%)",
  Access: "hsl(142, 71%, 45%)",
  Security: "hsl(0, 84%, 60%)",
  Gmail: "hsl(262, 83%, 58%)",
  Others: "hsl(25, 12%, 50%)",
};

export const tooltipStyle = {
  backgroundColor: "hsl(20, 12%, 11%)",
  border: "1px solid hsl(25, 12%, 18%)",
  borderRadius: "12px",
  color: "hsl(35, 25%, 88%)",
};

export const ticketStatusToCardStatus = (status = "", priority = "") => {
  return toTicketCardStatus(status, priority);
};

export const priorityToCardPriority = (priority = "") => priority.toLowerCase();

export const formatRelativeTime = (dateValue?: string | Date) => {
  if (!dateValue) return "Unknown";
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const getSlaInfo = (ticket) => {
  const deadline = ticket?.sla?.resolutionDeadline ? new Date(ticket.sla.resolutionDeadline).getTime() : null;
  if (!deadline || isTerminalTicketStatus(ticket)) {
    return { label: "Met", minutesRemaining: Infinity, risk: "safe" };
  }

  const minutesRemaining = Math.floor((deadline - Date.now()) / 60000);
  const abs = Math.abs(minutesRemaining);
  const label =
    minutesRemaining < 0
      ? `${Math.floor(abs / 60)}h ${abs % 60}m overdue`
      : `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}m`;

  const risk = minutesRemaining <= 60 ? "critical" : minutesRemaining <= 240 ? "warning" : "safe";
  return { label, minutesRemaining, risk };
};

export const getCurrentWeekTickets = (tickets) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());

  return tickets.filter((ticket) => {
    if (!ticket?.createdAt) return false;
    const createdAt = new Date(ticket.createdAt).getTime();
    return !Number.isNaN(createdAt) && createdAt >= startOfWeek.getTime() && createdAt <= now.getTime();
  });
};

export const buildDailyVolume = (tickets) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = days.map((day) => ({ name: day, tickets: 0, resolved: 0, created: 0 }));

  getCurrentWeekTickets(tickets).forEach((ticket) => {
    const day = new Date(ticket.createdAt).getDay();
    buckets[day].tickets += 1;
    buckets[day].created += 1;
    if (isResolvedStatus(ticket)) buckets[day].resolved += 1;
  });

  return buckets;
};

export const buildCategoryData = (tickets) => {
  const counts = tickets.reduce((acc, ticket) => {
    const category = ticket.category || "Others";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || categoryColors.Others,
  }));
};

export const getTicketSummary = (tickets) => {
  const active = tickets.filter((ticket) => !isTerminalTicketStatus(ticket));
  const resolved = tickets.filter((ticket) => isResolvedStatus(ticket));
  const unsolved = tickets.filter((ticket) => isUnsolvedStatus(ticket));
  const breached = tickets.filter((ticket) => getSlaInfo(ticket).minutesRemaining < 0);
  const atRisk = active.filter((ticket) => {
    const info = getSlaInfo(ticket);
    return info.risk !== "safe";
  });

  return {
    total: tickets.length,
    active: active.length,
    resolved: resolved.length,
    unsolved: unsolved.length,
    atRisk: atRisk.length,
    breached: breached.length,
    slaRate: tickets.length ? Math.round(((tickets.length - breached.length) / tickets.length) * 100) : 100,
  };
};

export const buildTeamPerformance = (users, tickets) =>
  users
    .filter((user) => user.role === "technician")
    .map((user) => {
      const assigned = tickets.filter((ticket) => ticket.assignedTo?._id === user._id);
      const resolved = assigned.filter((ticket) => isResolvedStatus(ticket)).length;
      const pending = assigned.length - resolved;
      const rated = assigned.filter((ticket) => ticket.rating?.score);
      const rating = rated.length
        ? (rated.reduce((sum, ticket) => sum + ticket.rating.score, 0) / rated.length).toFixed(1)
        : "4.5";

      return { ...user, resolved, pending, rating, assigned: assigned.length };
    });
