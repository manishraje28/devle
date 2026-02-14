import { Router } from 'express';
import { getProfile, getStats } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/profile', getProfile);
router.get('/stats', getStats);

export default router;
