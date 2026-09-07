export const TICKET_FILTERS = ["All", "Open", "In Progress", "Resolved", "Unsolved"] as const;

export const normalizeTicketStatus = (status = "") => (status === "Closed" ? "Unsolved" : status);

const COMPLETION_WINDOW_MS = 24 * 60 * 60 * 1000;

const isTicketLike = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === "object" && ("status" in value || "sla" in value || "createdAt" in value);

export const getTicketDeadline = (ticket) => {
  const deadline =
    ticket?.sla?.resolutionDeadline ||
    ticket?.sla?.responseDeadline ||
    (ticket?.createdAt ? new Date(new Date(ticket.createdAt).getTime() + COMPLETION_WINDOW_MS).toISOString() : null);

  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  return Number.isNaN(time) ? null : time;
};

export const isTicketExpired = (ticket) => {
  if (!isTicketLike(ticket)) return false;
  const savedStatus = normalizeTicketStatus(ticket.status);
  if (["Resolved", "Unsolved"].includes(savedStatus)) return false;

  const deadline = getTicketDeadline(ticket);
  return !!deadline && deadline < Date.now();
};

export const getEffectiveTicketStatus = (ticketOrStatus) => {
  if (isTicketLike(ticketOrStatus)) {
    const savedStatus = normalizeTicketStatus(ticketOrStatus.status || "Open");
    return isTicketExpired(ticketOrStatus) ? "Expired" : savedStatus;
  }

  return normalizeTicketStatus(ticketOrStatus || "");
};

export const isResolvedStatus = (ticketOrStatus: any = "") => getEffectiveTicketStatus(ticketOrStatus) === "Resolved";

export const isUnsolvedStatus = (ticketOrStatus: any = "") => {
  const effectiveStatus = getEffectiveTicketStatus(ticketOrStatus);
  return effectiveStatus === "Unsolved" || effectiveStatus === "Expired";
};

export const isTerminalTicketStatus = (ticketOrStatus: any = "") =>
  ["Resolved", "Unsolved", "Expired"].includes(getEffectiveTicketStatus(ticketOrStatus));

export const toTicketCardStatus = (ticketOrStatus: any = "", priority = "") => {
  const normalized = getEffectiveTicketStatus(ticketOrStatus);
  const ticketPriority = isTicketLike(ticketOrStatus) ? ticketOrStatus.priority : priority;
  if (normalized === "Expired") return "expired";
  if (isUnsolvedStatus(normalized)) return "unsolved";
  if (ticketPriority === "Critical" && !isTerminalTicketStatus(normalized)) return "urgent";
  if (normalized === "In Progress" || normalized === "On Hold") return "in_progress";
  if (isResolvedStatus(normalized)) return "resolved";
  return "open";
};

export const statusFilterMatches = (ticketOrStatus: any = "", activeFilter = "All") => {
  if (activeFilter === "All") return true;
  const effectiveStatus = getEffectiveTicketStatus(ticketOrStatus);
  if (activeFilter === "Unsolved") return effectiveStatus === "Unsolved" || effectiveStatus === "Expired";
  return effectiveStatus === activeFilter;
};
