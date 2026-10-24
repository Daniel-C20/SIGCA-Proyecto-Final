import { Router } from 'express';
import { currentUser, login } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(currentUser));
export default router;
