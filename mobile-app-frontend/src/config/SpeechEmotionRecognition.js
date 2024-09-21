import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';  // Import SecureStore from Expo
import {
    HUGGING_FACE_API_KEY,
} from '@env';

const query = async (filename) => {
    try {
        const data = await FileSystem.readAsStringAsync(filename, {
            encoding: FileSystem.EncodingType.Base64,
        }); // Read file as base64 string
        const buffer = Buffer.from(data, 'base64'); // Convert base64 string to buffer

        // Retrieve the JWT token from SecureStore
        const token = await SecureStore.getItemAsync('token');  // Get the JWT token

        const response = await fetch(
            'https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,  // Include JWT token in the Authorization header
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
