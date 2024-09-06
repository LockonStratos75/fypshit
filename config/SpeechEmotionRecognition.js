import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

const query = async (filename) => {
    try {
        const data = await FileSystem.readAsStringAsync(filename, {
            encoding: FileSystem.EncodingType.Base64,
        }); // Read file as base64 string
        const buffer = Buffer.from(data, 'base64'); // Convert base64 string to buffer
        const response = await fetch(
            'https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer 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', // Replace with your actual token
                    'Content-Type': 'audio/wav',
                },
                body: buffer,
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error querying the API:', error);
        if (error.response && error.response.status === 503) {
            console.log('API service unavailable, retrying...');
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            return query(filename); // Retry querying the API
        }
        throw error; // Re-throw the error if not a 503 error
    }
};

export default query;
