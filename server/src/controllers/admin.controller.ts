import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import { WordCategory } from '@prisma/client';

const addWordSchema = z.object({
    text: z.string().length(5).transform(v => v.toUpperCase()),
    category: z.nativeEnum(WordCategory).optional().default('GENERAL'),
    difficulty: z.string().optional().default('NORMAL'),
});

const setDailySchema = z.object({
    wordId: z.string().uuid(),
    date: z.string().transform(v => new Date(v)),
});

export async function addWord(req: AuthRequest, res: Response) {
    try {
        const data = addWordSchema.parse(req.body);
        const existing = await prisma.word.findUnique({ where: { text: data.text } });
        if (existing) return res.status(409).json({ success: false, error: 'Word already exists.' });

        const word = await prisma.word.create({
            data: { text: data.text, category: data.category, difficulty: data.difficulty },
        });

        return res.status(201).json({ success: true, data: word });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        }
        console.error('addWord error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function deleteWord(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        await prisma.word.update({ where: { id }, data: { isActive: false } });
        return res.json({ success: true, data: { message: 'Word deactivated.' } });
    } catch (err) {
        console.error('deleteWord error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function setDailyWord(req: AuthRequest, res: Response) {
    try {
        const data = setDailySchema.parse(req.body);
        const date = new Date(data.date);
        date.setUTCHours(0, 0, 0, 0);

        const existing = await prisma.dailyWord.findFirst({ where: { date } });
        if (existing) {
            await prisma.dailyWord.update({ where: { id: existing.id }, data: { wordId: data.wordId } });
        } else {
            await prisma.dailyWord.create({ data: { wordId: data.wordId, date } });
        }

        return res.json({ success: true, data: { message: 'Daily word set.' } });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        }
        console.error('setDailyWord error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}
