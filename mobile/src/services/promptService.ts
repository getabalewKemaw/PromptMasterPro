import api from './api';

export interface ImprovedPromptResponse {
    originalInput: string;
    improvedEnglish: string;
    improvedLocal: string | null;
    language: string;
}

export const promptService = {
    improvePrompt: async (promptText: string, language: string) => {
        const response = await api.post('/prompts/improve', {
            promptText,
            language,
        });
        return response.data.data as ImprovedPromptResponse;
    },

    createPrompt: async (data: {
        inputText: string;
        languageInput: string;
        languageOutput: string;
        category?: string;
    }) => {
        const response = await api.post('/prompts', data);
        return response.data.data;
    },

    improveVoicePrompt: async (uri: string, language: string) => {
        const formData = new FormData();
        formData.append('language', language);

        // Append file
        // React Native FormData expects { uri, name, type }
        formData.append('audio', {
            uri,
            name: 'recording.m4a',
            type: 'audio/m4a',
        } as any);

        const response = await api.post('/prompts/voice', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data as ImprovedPromptResponse;
    },
};
