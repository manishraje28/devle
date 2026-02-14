import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required.' });
    }
    next();
}
