import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

// Initialize Gemini
const getGeminiModel = () => {
    // Try both spellings and TRIM whitespace
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY)?.trim();

    if (!apiKey) {
        throw new AppError('GEMINI_API_KEY is not configured', 500);
    }

    // Debug log to confirm key is loaded (printing first 4 chars only)
    console.log(`[Gemini Service] Loaded API Key: ${apiKey.substring(0, 4)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash-001 as requested for best performance
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
): Promise<{ critique: string; improvedPrompt: string }> => {
    try {
        const model = getGeminiModel();

        const prompt = `
        You are a prompt engineering expert. 
        Analyze the given prompt, identify its weaknesses, and provide a vastly improved version.
        Prove that the first one is wrong or inefficient by explaining the issues.
        
        Return ONLY a JSON object with this key structure:
        {
            "critique": "Explanation of why the original prompt is weak and what was improved",
            "improvedPrompt": "The new, optimized prompt text"
        }
        
        Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
        
        Original Prompt: ${userPrompt}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        if (!text) {
            throw new AppError('Failed to improve prompt', 500);
        }

        // Clean up markdown code blocks if Gemini adds them
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(text);
            return {
                critique: jsonResponse.critique || "Improved for better clarity and effectiveness.",
                improvedPrompt: jsonResponse.improvedPrompt || text
            };
        } catch (e) {
            // Fallback if JSON parsing fails
            return {
                critique: "Automated improvement.",
                improvedPrompt: text
            };
        }
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw new AppError('Failed to improve prompt', 500);
    }
};
