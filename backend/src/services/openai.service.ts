import OpenAI from 'openai';
import { AppError } from '../middleware/errorHandler';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generatePromptWithGPT = async (
    userInput: string
): Promise<string> => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new AppError('OpenAI API key not configured', 500);
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful AI assistant that provides clear, concise, and useful responses to user queries. Focus on being practical and actionable.',
                },
                {
                    role: 'user',
                    content: userInput,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new AppError('Failed to generate response from GPT', 500);
        }

        return response;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);

        if (error.status === 401) {
            throw new AppError('Invalid OpenAI API key', 500);
        }

        if (error.status === 429) {
            throw new AppError('OpenAI rate limit exceeded. Please try again later.', 429);
        }

        throw new AppError('Failed to generate AI response', 500);
    }
};

export const improvePrompt = async (
    userPrompt: string
): Promise<string> => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new AppError('OpenAI API key not configured', 500);
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a prompt engineering expert. Improve the given prompt to make it clearer, more specific, and more effective for AI models. Return only the improved prompt without explanations.',
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 300,
        });

        const improvedPrompt = completion.choices[0]?.message?.content;

        if (!improvedPrompt) {
            throw new AppError('Failed to improve prompt', 500);
        }

        return improvedPrompt;
    } catch (error: any) {
        console.error('OpenAI API Error:', error);
        throw new AppError('Failed to improve prompt', 500);
    }
};
