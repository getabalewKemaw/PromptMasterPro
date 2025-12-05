import axios from 'axios';
import { AppError } from '../middleware/errorHandler';

const HASAB_API_URL = 'https://api.hasab.ai/v1/translate';

export const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> => {
    try {
        const apiKey = process.env.HASAB_API_KEY;

        if (!apiKey) {
            throw new AppError('Hasab API key not configured', 500);
        }

        // If source and target are the same, return original text
        if (sourceLang === targetLang) {
            return text;
        }

        const response = await axios.post(
            HASAB_API_URL,
            {
                text,
                source_language: sourceLang,
                target_language: targetLang,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            }
        );

        const translatedText = response.data?.translated_text || response.data?.translation;

        if (!translatedText) {
            console.error('Hasab API response:', response.data);
            throw new AppError('Translation failed - no text returned', 500);
        }

        return translatedText;
    } catch (error: any) {
        console.error('Hasab Translation Error:', error.message);

        // If Hasab API fails, return original text as fallback
        // This ensures the app doesn't break if translation service is down
        if (error.response?.status === 401) {
            console.warn('Invalid Hasab API key - returning original text');
        } else if (error.code === 'ECONNABORTED') {
            console.warn('Hasab API timeout - returning original text');
        } else {
            console.warn('Hasab API error - returning original text');
        }

        // Return original text as fallback
        return text;
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
