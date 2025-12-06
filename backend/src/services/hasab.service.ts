import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

const HASAB_API_URL = 'https://hasab.co/api/v1/translate';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ... (keep existing imports)

export const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> => {
    try {
        const apiKey = process.env.HASAB_API_KEY;

        // Validation for Hasab Key
        if (!apiKey) throw new Error('Hasab API Key missing');

        // ... (Try Hasab Logic) ... 
        // If Hasab fails (which it is doing now), we enter catch block.
        // But wait, the current logic returns original text.
        // I will change it to return Gemini Translation.

        // ... (Keep existing Hasab Axios call) ...
        const response = await axios.post(
            HASAB_API_URL,
            { text, source_language: sourceLang, target_language: targetLang },
            { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 5000 }
        );

        return response.data?.translated_text || response.data?.translation || text;

    } catch (error: any) {
        console.warn('Hasab API Failed, falling back to Gemini:', error.message);

        // Fallback: Use Gemini for translation
        try {
            const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMENI_API_KEY;
            if (!geminiKey) return text; // Give up if no keys at all

            const genAI = new GoogleGenerativeAI(geminiKey.trim());
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Return ONLY the translated text. Text: "${text}"`;
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (geminiError) {
            console.error('Gemini Fallback Failed:', geminiError);
            return text;
        }
    }
};

// Language code mapping for Hasab API
export const SUPPORTED_LANGUAGES = {
    en: 'English',
    am: 'Amharic',
    om: 'Afaan Oromo',
    ti: 'Tigrinya',
    so: 'Somali',
    ar: 'Arabic',
};

export const isLanguageSupported = (langCode: string): boolean => {
    return langCode in SUPPORTED_LANGUAGES;
};
