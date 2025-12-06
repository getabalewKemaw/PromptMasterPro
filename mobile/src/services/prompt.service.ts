import api from './api';

export interface PromptImprovementResponse {
    status: string;
    data: {
        originalInput: string;
        improvedEnglish: string;
        englishCritique?: string;
        improvedLocal?: string;
        localCritique?: string;
        language: string;
    };
}

export const promptService = {
    improvePrompt: async (promptText: string, language: string = 'en'): Promise<PromptImprovementResponse> => {
        const response = await api.post('/prompts/improve', {
            promptText,
            language,
        });
        return response.data;
    },

    // Voice support will need FormData
    improveVoicePrompt: async (audioUri: string, language: string = 'en'): Promise<PromptImprovementResponse> => {
        const formData = new FormData();

        // Append file - React Native specific way
        const filename = audioUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `audio/${match[1]}` : 'audio/m4a';

        // @ts-ignore: FormData expects Blob but RN sends object
        formData.append('audio', {
            uri: audioUri,
            name: filename || 'recording.m4a',
            type,
        });
        formData.append('language', language);

        const response = await api.post('/prompts/voice', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
