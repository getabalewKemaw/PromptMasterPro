import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getAllTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const templates = await prisma.template.findMany({
            where: { isPublic: true },
            orderBy: { usageCount: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const total = await prisma.template.count({
            where: { isPublic: true },
        });

        res.status(200).json({
            status: 'success',
            data: {
                templates,
                pagination: {
                    total,
                    limit: Number(limit),
                    offset: Number(offset),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTemplatesByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { category } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const templates = await prisma.template.findMany({
            where: {
                category,
                isPublic: true,
            },
            orderBy: { usageCount: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const total = await prisma.template.count({
            where: { category, isPublic: true },
        });

        res.status(200).json({
            status: 'success',
            data: {
                templates,
                category,
                pagination: {
                    total,
                    limit: Number(limit),
                    offset: Number(offset),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getTemplateById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const template = await prisma.template.findUnique({
            where: { id },
        });

        if (!template || !template.isPublic) {
            throw new AppError('Template not found', 404);
        }

        // Increment usage count
        await prisma.template.update({
            where: { id },
            data: { usageCount: template.usageCount + 1 },
        });

        res.status(200).json({
            status: 'success',
            data: { template },
        });
    } catch (error) {
        next(error);
    }
};
