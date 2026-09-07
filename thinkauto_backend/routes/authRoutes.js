import express from 'express';
import {
  signup,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  updateAvailability
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.put('/availability', protect, updateAvailability);

export default router;
