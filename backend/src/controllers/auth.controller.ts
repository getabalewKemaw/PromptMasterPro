import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password, preferredLanguage } = req.body;

        if (!name || !email || !password) {
            throw new AppError('Name, email, and password are required', 400);
        }

       
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 409);
        }

       
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                preferredLanguage: preferredLanguage || 'en',
            },
            select: {
                id: true,
                name: true,
                email: true,
                preferredLanguage: true,
                createdAt: true,
            },
        });

        // Generate JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError('JWT secret not configured', 500);
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '7d',
        });

        res.status(201).json({
            status: 'success',
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError('JWT secret not configured', 500);
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret, {
            expiresIn: '7d',
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    preferredLanguage: user.preferredLanguage,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                preferredLanguage: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
