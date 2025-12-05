import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
}

interface TokenPayload extends JwtPayload {
    userId: string;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new AppError('JWT secret not configured', 500);
        }

        try {
            // @ts-ignore - TypeScript has issues with jwt.verify return type
            const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

            if (!decoded || !decoded.userId) {
                throw new AppError('Invalid token payload', 401);
            }

            req.userId = decoded.userId;
            next();
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                throw new AppError('Token expired', 401);
            }
            if (jwtError instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid token', 401);
            }
            throw jwtError;
        }
    } catch (error) {
        next(error);
    }
};
