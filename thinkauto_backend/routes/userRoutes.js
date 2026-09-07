import express from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getTechnicians,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/technicians', protect, authorize('admin', 'technician'), getTechnicians);
router.get('/stats', protect, authorize('admin'), getUserStats);

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router;
