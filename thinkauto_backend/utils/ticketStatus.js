export const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Unsolved', 'On Hold'];
export const TERMINAL_TICKET_STATUSES = ['Resolved', 'Unsolved'];
export const TICKET_COMPLETION_WINDOW_HOURS = 24;

export const normalizeTicketStatus = (status) => {
  if (status === 'Closed') return 'Unsolved';
  return status;
};

export const isTicketTerminal = (status) => TERMINAL_TICKET_STATUSES.includes(normalizeTicketStatus(status));

export const getTicketCompletionDeadline = (ticket) => {
  const createdAt = ticket?.createdAt ? new Date(ticket.createdAt).getTime() : Date.now();
  return new Date(createdAt + TICKET_COMPLETION_WINDOW_HOURS * 60 * 60 * 1000);
};

export const isTicketPastCompletionWindow = (ticket, now = new Date()) => (
  now.getTime() > getTicketCompletionDeadline(ticket).getTime() ||
  (ticket?.sla?.resolutionDeadline && now.getTime() > new Date(ticket.sla.resolutionDeadline).getTime()) ||
  (ticket?.sla?.responseDeadline && now.getTime() > new Date(ticket.sla.responseDeadline).getTime())
);
