import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generatePromptWithGPT } from '../services/openai.service';
import { translateText } from '../services/hasab.service';

const prisma = new PrismaClient();

export const createPrompt = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { inputText, languageInput, languageOutput, category } = req.body;

        if (!inputText) {
            throw new AppError('Input text is required', 400);
        }

        let translatedInput = inputText;
        let promptText = inputText;

        // Step 1: Translate input to English if needed
        if (languageInput && languageInput !== 'en') {
            translatedInput = await translateText(inputText, languageInput, 'en');
            promptText = translatedInput;
        }

        // Step 2: Generate AI response using GPT
        const gptOutput = await generatePromptWithGPT(promptText);

        // Step 3: Translate output back to user's language if needed
        let translatedOutput = gptOutput;
        if (languageOutput && languageOutput !== 'en') {
            translatedOutput = await translateText(gptOutput, 'en', languageOutput);
        }

        // Step 4: Save to database
        const prompt = await prisma.prompt.create({
            data: {
                userId,
                inputText,
                promptText,
                gptOutput,
                translatedInput: languageInput !== 'en' ? translatedInput : null,
                translatedOutput: languageOutput !== 'en' ? translatedOutput : null,
                languageInput: languageInput || 'en',
                languageOutput: languageOutput || 'en',
                category: category || null,
            },
        });

        res.status(201).json({
            status: 'success',
            data: {
                prompt: {
                    ...prompt,
                    displayOutput: translatedOutput,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUserPrompts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const { category, isFavorite, limit = 50, offset = 0 } = req.query;

        const where: any = { userId };
        if (category) where.category = category;
        if (isFavorite === 'true') where.isFavorite = true;

        const prompts = await prisma.prompt.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
        });

        const total = await prisma.prompt.count({ where });

        res.status(200).json({
            status: 'success',
            data: {
                prompts,
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

export const getPromptById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const prompt = await prisma.prompt.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!prompt) {
            throw new AppError('Prompt not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: { prompt },
        });
    } catch (error) {
        next(error);
    }
};

export const deletePrompt = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const prompt = await prisma.prompt.findFirst({
            where: { id, userId },
        });

        if (!prompt) {
            throw new AppError('Prompt not found', 404);
        }

        await prisma.prompt.delete({
            where: { id },
        });

        res.status(200).json({
            status: 'success',
            message: 'Prompt deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const toggleFavorite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const prompt = await prisma.prompt.findFirst({
            where: { id, userId },
        });

        if (!prompt) {
            throw new AppError('Prompt not found', 404);
        }

        const updatedPrompt = await prisma.prompt.update({
            where: { id },
            data: { isFavorite: !prompt.isFavorite },
        });

        res.status(200).json({
            status: 'success',
            data: { prompt: updatedPrompt },
        });
    } catch (error) {
        next(error);
    }
};
