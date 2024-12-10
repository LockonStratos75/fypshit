// services/textToSpeech.js

import axios from 'axios';
import { GOOGLE_CLOUD_API_KEY } from '@env';

/**
 * Fetch available voices from Google Cloud Text-to-Speech API
 */
export const getAvailableVoices = async () => {
    const url = `https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_CLOUD_API_KEY}`;

    try {
        const response = await axios.get(url);
        const allVoices = response.data.voices;

        // Define the language codes to include
        const languageCodesToInclude = ['en-IN', 'en-GB', 'en-US'];

        // Define keywords to match in the voice name or other properties
        const allowedKeywords = ['journey'];

        // Filter the voices
        const filteredVoices = allVoices.filter(voice => {
            // Check if the voice supports desired language codes
            const isDesiredLanguage = voice.languageCodes.some(code => languageCodesToInclude.includes(code));

            // Check if the voice name includes any of the allowed keywords
            const matchesKeyword = allowedKeywords.some(keyword =>
                voice.name.toLowerCase().includes(keyword.toLowerCase())
            );

            return isDesiredLanguage && matchesKeyword;
        });

        return filteredVoices; // returns the filtered array of voices
    } catch (error) {
        console.error('Error fetching available voices:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getSpeech = async (text, selectedVoice, audioEncoding = 'LINEAR16') => {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`;

    // Extract the first language code from the selected voice
    const languageCode = selectedVoice.languageCodes[0];

    const data = {
        input: { text },
        voice: {
            languageCode: languageCode,
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender || 'NEUTRAL',
        },
        audioConfig: {
            audioEncoding: audioEncoding,
        },
    };

    try {
        const response = await axios.post(url, data);
        return response.data.audioContent;
    } catch (error) {
        console.error('Error synthesizing speech:', error.response ? error.response.data : error.message);
        throw error;
    }
};

