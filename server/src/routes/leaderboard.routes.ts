import { Router } from 'express';
import { getDailyLeaderboard, getAllTimeLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();
router.get('/daily', getDailyLeaderboard);
router.get('/all-time', getAllTimeLeaderboard);

export default router;
