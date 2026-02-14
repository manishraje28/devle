import { Router } from 'express';
import { addWord, deleteWord, setDailyWord } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware, adminMiddleware);
router.post('/word', addWord);
router.delete('/word/:id', deleteWord);
router.post('/daily', setDailyWord);

export default router;
