import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { config } from '../config/env';

const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

function generateTokens(userId: string, role: string) {
    const payload = { id: userId, role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' } as jwt.SignOptions);
    return { token, refreshToken };
}

export async function register(req: Request, res: Response) {
    try {
        const data = registerSchema.parse(req.body);

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { username: data.username }] },
        });
        if (existing) {
            return res.status(409).json({ success: false, error: 'Username or email already taken.' });
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
            data: { username: data.username, email: data.email, passwordHash },
        });

        // Initialize stats row
        await prisma.stats.create({ data: { userId: user.id } });

        const tokens = generateTokens(user.id, user.role);
        return res.status(201).json({
            success: true,
            data: { ...tokens, user: { id: user.id, username: user.username, role: user.role } },
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        }
        console.error('Register error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials.' });

        const valid = await bcrypt.compare(data.password, user.passwordHash);
        if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials.' });

        const tokens = generateTokens(user.id, user.role);
        return res.json({
            success: true,
            data: { ...tokens, user: { id: user.id, username: user.username, role: user.role } },
        });
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: err.issues.map(i => i.message).join(', ') });
        }
        console.error('Login error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
}

export async function refreshToken(req: Request, res: Response) {
    try {
        const { refreshToken: rt } = req.body;
        if (!rt) return res.status(400).json({ success: false, error: 'Refresh token required.' });

        const decoded = jwt.verify(rt, config.jwtRefreshSecret) as { id: string; role: string };
        const tokens = generateTokens(decoded.id, decoded.role);
        return res.json({ success: true, data: tokens });
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
    }
}
