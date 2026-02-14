import { Router } from 'express';
import { getDailyGame, submitGuess, getGuestDailyGame, submitGuestGuess } from '../controllers/game.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const guessLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, error: 'Too many guesses. Slow down.' },
});

const router = Router();

// Guest routes (no auth)
router.get('/guest/daily', getGuestDailyGame);
router.post('/guest/guess', guessLimiter, submitGuestGuess);

// Authenticated routes
router.get('/daily', authMiddleware, getDailyGame);
router.post('/guess', authMiddleware, guessLimiter, submitGuess);

export default router;
