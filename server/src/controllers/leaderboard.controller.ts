import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getDailyLeaderboard(_req: AuthRequest, res: Response) {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const scores = await prisma.game.findMany({
            where: { mode: 'DAILY', playedAt: { gte: today }, won: true },
            orderBy: [{ attempts: 'asc' }, { playedAt: 'asc' }],
            take: 50,
            include: { user: { select: { username: true } } },
        });

        return res.json({
            success: true,
            data: scores.map((s, i) => ({
                rank: i + 1,
                username: s.user.username,
                attempts: s.attempts,
                playedAt: s.playedAt,
            })),
        });
    } catch (err) {
        console.error('getDailyLeaderboard error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function getAllTimeLeaderboard(_req: AuthRequest, res: Response) {
    try {
        const topPlayers = await prisma.stats.findMany({
            orderBy: { xp: 'desc' },
            take: 50,
            include: { user: { select: { username: true } } },
        });

        return res.json({
            success: true,
            data: topPlayers.map((s, i) => ({
                rank: i + 1,
                username: s.user.username,
                xp: s.xp,
                wins: s.wins,
                totalGames: s.totalGames,
                maxStreak: s.maxStreak,
            })),
        });
    } catch (err) {
        console.error('getAllTimeLeaderboard error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}
