import { Response, Request } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import { evaluateGuess, getMaxAttempts, calculateXP } from '../utils/gameLogic';
import { GameMode } from '@prisma/client';
import { config } from '../config/env';

// ── Map game mode → word difficulty ──
function getDifficultyForMode(mode: string): string {
    switch (mode) {
        case 'CHILL': return 'EASY';
        case 'EXTREME': return 'HARD';
        default: return 'MEDIUM';
    }
}

// ── Pick a random word by difficulty ──
async function pickWordForMode(mode: string, category?: string) {
    const difficulty = getDifficultyForMode(mode);
    const where: any = { isActive: true, difficulty };
    if (mode === 'STACK' && category) where.category = category;

    const count = await prisma.word.count({ where });
    if (count === 0) {
        // Fallback: any active word
        const fc = await prisma.word.count({ where: { isActive: true } });
        const skip = Math.floor(Math.random() * fc);
        return prisma.word.findFirst({ where: { isActive: true }, skip });
    }
    const skip = Math.floor(Math.random() * count);
    return prisma.word.findFirst({ where, skip });
}

// ══════════════════════════════════════════════════
// GUEST ENDPOINTS (no auth required)
// ══════════════════════════════════════════════════

// ── Guest: start a game → returns a gameToken with the target word baked in ──
export async function getGuestDailyGame(req: Request, res: Response) {
    try {
        const mode = ((req.query.mode as string) || 'DAILY').toUpperCase();
        const maxAttempts = getMaxAttempts(mode);
        const difficulty = getDifficultyForMode(mode);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let targetWordId: string;

        if (mode === 'DAILY') {
            // Daily mode: everyone gets the same word
            let dailyWord = await prisma.dailyWord.findFirst({ where: { date: today }, include: { word: true } });
            if (!dailyWord) {
                const word = await pickWordForMode('DAILY');
                if (!word) return res.status(500).json({ success: false, error: 'No words available.' });
                dailyWord = await prisma.dailyWord.create({ data: { wordId: word.id, date: today }, include: { word: true } });
            }
            targetWordId = dailyWord.wordId;
        } else {
            // Other modes: pick a random word matching the mode's difficulty
            const word = await pickWordForMode(mode, req.query.category as string);
            if (!word) return res.status(500).json({ success: false, error: 'No words for this difficulty.' });
            targetWordId = word.id;
        }

        // Create a signed token containing the target word — client sends this back with each guess
        const gameToken = jwt.sign(
            { wordId: targetWordId, mode, difficulty },
            config.jwtSecret,
            { expiresIn: '24h' } as jwt.SignOptions
        );

        return res.json({
            success: true,
            data: { wordLength: 5, maxAttempts, mode, difficulty, gameToken },
        });
    } catch (err) {
        console.error('getGuestDailyGame error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

// ── Guest: submit a guess (send gameToken to identify which word) ──
const guestGuessSchema = z.object({
    guess: z.string().length(5),
    gameToken: z.string(),
});

export async function submitGuestGuess(req: Request, res: Response) {
    try {
        const { guess, gameToken } = guestGuessSchema.parse(req.body);
        const g = guess.toUpperCase();

        // Validate word exists in dictionary
        const wordExists = await prisma.word.findUnique({ where: { text: g } });
        if (!wordExists) return res.status(400).json({ success: false, error: 'Not in word list.' });

        // Decode the game token to get target word
        let decoded: { wordId: string; mode: string };
        try {
            decoded = jwt.verify(gameToken, config.jwtSecret) as any;
        } catch {
            return res.status(400).json({ success: false, error: 'Invalid or expired game. Start a new game.' });
        }

        const targetWord = await prisma.word.findUnique({ where: { id: decoded.wordId } });
        if (!targetWord) return res.status(500).json({ success: false, error: 'Target word not found.' });

        const result = evaluateGuess(targetWord.text, g);
        const isCorrect = result.every(r => r.status === 'correct');

        return res.json({
            success: true,
            data: { result, won: isCorrect },
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        }
        console.error('submitGuestGuess error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

// ══════════════════════════════════════════════════
// AUTHENTICATED ENDPOINTS
// ══════════════════════════════════════════════════

export async function getDailyGame(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const mode = ((req.query.mode as string) || 'DAILY').toUpperCase() as GameMode;
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (mode === 'DAILY') {
            let dailyWord = await prisma.dailyWord.findFirst({ where: { date: today }, include: { word: true } });
            if (!dailyWord) {
                const word = await pickWordForMode('DAILY');
                if (!word) return res.status(500).json({ success: false, error: 'No words available.' });
                dailyWord = await prisma.dailyWord.create({ data: { wordId: word.id, date: today }, include: { word: true } });
            }

            let game = await prisma.game.findFirst({
                where: { userId, wordId: dailyWord.wordId, mode: 'DAILY', playedAt: { gte: today } },
            });
            if (!game) {
                game = await prisma.game.create({
                    data: { userId, wordId: dailyWord.wordId, mode: 'DAILY', attempts: 0, won: false, completed: false, guesses: [] },
                });
            }

            const maxAttempts = getMaxAttempts('DAILY');
            const evaluatedGuesses = game.guesses.length > 0
                ? game.guesses.map(g => evaluateGuess(dailyWord!.word.text, g)) : [];

            return res.json({
                success: true,
                data: { gameId: game.id, mode: game.mode, attempts: game.attempts, maxAttempts, won: game.won, completed: game.completed, guesses: evaluatedGuesses },
            });
        }

        // Non-daily authenticated: pick word by difficulty
        const word = await pickWordForMode(mode, req.query.category as string);
        if (!word) return res.status(500).json({ success: false, error: 'No words for this difficulty.' });

        let game = await prisma.game.findFirst({
            where: { userId, mode, completed: false, playedAt: { gte: today } },
        });
        if (!game) {
            game = await prisma.game.create({
                data: { userId, wordId: word.id, mode, attempts: 0, won: false, completed: false, guesses: [] },
            });
        }

        const targetWord = await prisma.word.findUnique({ where: { id: game.wordId } });
        const maxAttempts = getMaxAttempts(mode);
        const evaluatedGuesses = (game.guesses.length > 0 && targetWord)
            ? game.guesses.map(g => evaluateGuess(targetWord.text, g)) : [];

        return res.json({
            success: true,
            data: { gameId: game.id, mode: game.mode, attempts: game.attempts, maxAttempts, won: game.won, completed: game.completed, guesses: evaluatedGuesses },
        });
    } catch (err) {
        console.error('getDailyGame error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

const guessSchema = z.object({
    gameId: z.string().uuid(),
    guess: z.string().length(5),
});

export async function submitGuess(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId!;
        const { gameId, guess } = guessSchema.parse(req.body);
        const g = guess.toUpperCase();

        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) return res.status(404).json({ success: false, error: 'Game not found.' });
        if (game.userId !== userId) return res.status(403).json({ success: false, error: 'Not your game.' });
        if (game.completed) return res.status(400).json({ success: false, error: 'Game already finished.' });

        const maxAttempts = getMaxAttempts(game.mode);
        if (game.attempts >= maxAttempts) return res.status(400).json({ success: false, error: 'No attempts left.' });

        const wordExists = await prisma.word.findUnique({ where: { text: g } });
        if (!wordExists) return res.status(400).json({ success: false, error: 'Not in word list.' });

        const targetWord = await prisma.word.findUnique({ where: { id: game.wordId } });
        if (!targetWord) return res.status(500).json({ success: false, error: 'Target word missing.' });

        const result = evaluateGuess(targetWord.text, g);
        const isCorrect = result.every(r => r.status === 'correct');
        const newAttempts = game.attempts + 1;
        const isGameOver = isCorrect || newAttempts >= maxAttempts;

        await prisma.game.update({
            where: { id: gameId },
            data: { guesses: { push: g }, attempts: newAttempts, won: isCorrect, completed: isGameOver },
        });

        if (isGameOver) {
            const xp = calculateXP(game.mode, newAttempts, isCorrect);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const stats = await prisma.stats.findUnique({ where: { userId } });
            if (stats) {
                const lastPlayed = stats.lastPlayedDate;
                const yesterday = new Date(today);
                yesterday.setUTCDate(yesterday.getUTCDate() - 1);
                let newStreak = stats.currentStreak;
                if (isCorrect) {
                    newStreak = (lastPlayed && lastPlayed.getTime() === yesterday.getTime()) ? stats.currentStreak + 1 : 1;
                } else { newStreak = 0; }
                await prisma.stats.update({
                    where: { userId },
                    data: { totalGames: { increment: 1 }, wins: isCorrect ? { increment: 1 } : undefined, xp: { increment: xp }, currentStreak: newStreak, maxStreak: Math.max(newStreak, stats.maxStreak), lastPlayedDate: today },
                });
            }
        }

        return res.json({
            success: true,
            data: { result, won: isCorrect, attempts: newAttempts, maxAttempts, gameOver: isGameOver },
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        console.error('submitGuess error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}
