import Ticket from '../models/Ticket.js';
import {
  TERMINAL_TICKET_STATUSES,
  getTicketCompletionDeadline,
  isTicketPastCompletionWindow,
  isTicketTerminal,
} from '../utils/ticketStatus.js';

export const markTicketUnsolved = (ticket, now = new Date()) => {
  ticket.status = 'Unsolved';
  ticket.sla = {
    ...(ticket.sla || {}),
    breached: true
  };
  ticket.verification = {
    ...(ticket.verification || {}),
    otp: undefined,
    otpExpiry: undefined
  };
  ticket.resolution = {
    ...(ticket.resolution || {}),
    text: `Ticket was not verified within the required 24-hour window ending ${getTicketCompletionDeadline(ticket).toISOString()}`,
    resolvedAt: ticket.resolution?.resolvedAt || now
  };
};

export const applyTicketDeadline = async (ticket, now = new Date()) => {
  if (!ticket || isTicketTerminal(ticket.status) || !isTicketPastCompletionWindow(ticket, now)) {
    return ticket;
  }

  markTicketUnsolved(ticket, now);
  await ticket.save();
  return ticket;
};

export const enforceTicketDeadlines = async (scope = {}) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  await Ticket.updateMany(
    {
      ...scope,
      status: { $nin: TERMINAL_TICKET_STATUSES },
      $or: [
        { createdAt: { $lt: cutoff } },
        { 'sla.resolutionDeadline': { $lt: now } },
        { 'sla.responseDeadline': { $lt: now } }
      ]
    },
    {
      $set: {
        status: 'Unsolved',
        'sla.breached': true,
        'resolution.text': 'Ticket was not verified within the required 24-hour window',
        'resolution.resolvedAt': now
      },
      $unset: {
        'verification.otp': '',
        'verification.otpExpiry': ''
      }
    }
  );
};
