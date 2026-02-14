import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getProfile(req: AuthRequest, res: Response) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: { id: true, username: true, email: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
        return res.json({ success: true, data: user });
    } catch (err) {
        console.error('getProfile error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function getStats(req: AuthRequest, res: Response) {
    try {
        const stats = await prisma.stats.findUnique({ where: { userId: req.userId! } });
        if (!stats) {
            return res.json({
                success: true,
                data: { currentStreak: 0, maxStreak: 0, totalGames: 0, wins: 0, xp: 0 },
            });
        }
        return res.json({ success: true, data: stats });
    } catch (err) {
        console.error('getStats error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}
