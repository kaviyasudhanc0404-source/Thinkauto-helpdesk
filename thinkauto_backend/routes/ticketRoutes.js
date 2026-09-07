import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  addComment,
  assignTicket,
  getTicketStats,
  requestVerification,
  verifyTicketCompletion
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.get('/stats', protect, authorize('admin'), getTicketStats);

router.route('/:id')
  .get(protect, getTicket)
  .put(protect, authorize('technician', 'admin'), updateTicket);

router.post('/:id/comments', protect, addComment);
router.put('/:id/assign', protect, authorize('admin'), assignTicket);
router.post('/:id/request-verification', protect, authorize('technician', 'admin'), requestVerification);
router.post('/:id/verify-completion', protect, verifyTicketCompletion);

export default router;
