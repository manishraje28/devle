import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';
import userRoutes from './routes/user.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ── Security ──
app.use(helmet());

// Allow multiple CORS origins (comma-separated in env, e.g. "http://localhost:3000,https://devle-livid.vercel.app")
const allowedOrigins = (config.corsOrigin || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ── Health check ──
app.get('/', (_req, res) => {
    res.json({ success: true, data: { message: 'DEVLE API v1.0' } });
});

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

export default app;
