import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generatePromptWithGemini, improvePromptWithGemini, transcribeAudioWithGemini } from '../services/gemini.service';
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

        // Step 2: Generate AI response using GPT (now Gemini)
        const gptOutput = await generatePromptWithGemini(promptText);

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

export const improvePromptText = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // ... existing code ...
    try {
        const { promptText, language = 'en' } = req.body;
        // ... (keep existing logic) ...
        if (!promptText) {
            throw new AppError('Prompt text is required', 400);
        }

        // Step 1: Translate to English if needed
        let englishInput = promptText;
        if (language !== 'en') {
            englishInput = await translateText(promptText, language, 'en');
        }

        // Step 2: Improve the prompt using AI (in English)
        const improvementResult = await improvePromptWithGemini(englishInput);
        const { critique, improvedPrompt } = improvementResult;

        // Step 3: Translate back to original language if needed
        let improvedLocalPrompt = improvedPrompt;
        let localCritique = critique;

        if (language !== 'en') {
            // Parallel translation for speed
            const [translatedPrompt, translatedCritique] = await Promise.all([
                translateText(improvedPrompt, 'en', language),
                translateText(critique, 'en', language)
            ]);
            improvedLocalPrompt = translatedPrompt;
            localCritique = translatedCritique;
        }

        res.status(200).json({
            status: 'success',
            data: {
                originalInput: promptText,
                improvedEnglish: improvedPrompt,
                englishCritique: critique,
                improvedLocal: language !== 'en' ? improvedLocalPrompt : null,
                localCritique: language !== 'en' ? localCritique : null,
                language: language
            },
        });
    } catch (error) {
        next(error);
    }
};

export const processVoicePrompt = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            throw new AppError('No audio file provided', 400);
        }

        const language = req.body.language || 'en';
        const filePath = req.file.path;

        // Step 1: Transcribe Audio
        const transcribedText = await transcribeAudioWithGemini(filePath);

        // Step 2: Run the existing improvement flow
        let englishInput = transcribedText;
        if (language !== 'en') {
            englishInput = await translateText(transcribedText, language, 'en');
        }

        const improvementResult = await improvePromptWithGemini(englishInput);
        const { critique, improvedPrompt } = improvementResult;

        let improvedLocalPrompt = improvedPrompt;
        let localCritique = critique;

        if (language !== 'en') {
            const [translatedPrompt, translatedCritique] = await Promise.all([
                translateText(improvedPrompt, 'en', language),
                translateText(critique, 'en', language)
            ]);
            improvedLocalPrompt = translatedPrompt;
            localCritique = translatedCritique;
        }

        // Clean up file
        // fs.unlinkSync(filePath); // Optional: delete after processing

        res.status(200).json({
            status: 'success',
            data: {
                originalInput: transcribedText,
                improvedEnglish: improvedPrompt,
                englishCritique: critique,
                improvedLocal: language !== 'en' ? improvedLocalPrompt : null,
                localCritique: language !== 'en' ? localCritique : null,
                language: language
            },
        });

    } catch (error) {
        next(error);
    }
};
