import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

// Initialize Gemini
const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new AppError('GEMINI_API_KEY is not configured', 500);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for multimodal (audio/image) support and speed
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export const transcribeAudioWithGemini = async (filePath: string): Promise<string> => {
    try {
        const model = getGeminiModel();

        // Read file as base64
        const audioData = fs.readFileSync(filePath);
        const base64Audio = audioData.toString('base64');

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'audio/mpeg', // Assuming mp3/m4a, Gemini is flexible
                    data: base64Audio
                }
            },
            { text: "Transcribe this audio exactly as it is spoken. Return ONLY the text." }
        ]);

        const text = result.response.text();
        if (!text) throw new Error('No transcription generated');

        return text.trim();
    } catch (error: any) {
        console.error('Gemini Audio Error:', error);
        throw new AppError('Failed to transcribe audio', 500);
    }
};

export const generatePromptWithGemini = async (
    userInput: string
): Promise<string> => {
    try {
        const model = getGeminiModel();
        // ... rest of file

        const prompt = `
        You are a helpful AI assistant that provides clear, concise, and useful responses to user queries. 
        Focus on being practical and actionable.
        
        User Query: ${userInput}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new AppError('Failed to generate response from Gemini', 500);
        }

        return text;
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new AppError('Failed to generate AI response', 500);
    }
};

export const improvePromptWithGemini = async (
    userPrompt: string
): Promise<string> => {
    try {
        const model = getGeminiModel();

        const prompt = `
        You are a prompt engineering expert. Improve the given prompt to make it clearer, more specific, and more effective for AI models. 
        Return ONLY the improved prompt text without any explanations or quotes.
        
        Original Prompt: ${userPrompt}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new AppError('Failed to improve prompt', 500);
        }

        return text.trim();
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new AppError('Failed to improve prompt', 500);
    }
};
