// SpeechEmotionRecognition.js

import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { FASTIP } from '@env';

const query = async (filename) => {
    try {
        console.log('Reading file:', filename);

        const fileInfo = await FileSystem.getInfoAsync(filename);
        console.log('File info:', fileInfo);

        const formData = new FormData();
        formData.append('file', {
            uri: filename,
            name: 'audio.wav',
            type: 'audio/wav',
        });

        // // Log FormData entries
        // formData.forEach((value, key) => {
        //     console.log(`${key}: ${value}`);
        // });

        console.log('Sending request to FastAPI service at', `${FASTIP}/predict`);
        const response = await axios.post(`${FASTIP}/predict`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Increase timeout if necessary
            timeout: 60000, // 60 seconds
        });



        console.log('Received response from FastAPI:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error querying the API:', error);
        throw error;
    }
};


export default query;
