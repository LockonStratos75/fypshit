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

//
// import * as FileSystem from 'expo-file-system';
// import axios from 'axios';
// import { Buffer } from 'buffer';
//
// const API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition";
// const API_KEY = "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"; // Replace with your Hugging Face API token
//
// const base64ToUint8Array = (base64) => {
//     const binaryString = Buffer.from(base64, 'base64').toString('binary');
//     const len = binaryString.length;
//     const bytes = new Uint8Array(len);
//     for (let i = 0; i < len; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//     }
//     return bytes;
// };
//
// const query = async (filename) => {
//     try {
//         console.log('Reading file:', filename);
//
//         const fileInfo = await FileSystem.getInfoAsync(filename);
//         console.log('File info:', fileInfo);
//
//         if (!fileInfo.exists) {
//             throw new Error("File does not exist.");
//         }
//
//         // Read the file as Base64 string
//         const fileData = await FileSystem.readAsStringAsync(filename, {
//             encoding: FileSystem.EncodingType.Base64,
//         });
//
//         // Convert Base64 to Uint8Array
//         const binaryData = base64ToUint8Array(fileData);
//
//         console.log('Sending request to Hugging Face API at', API_URL);
//
//         const response = await axios.post(
//             API_URL,
//             binaryData.buffer, // Pass the binary data as ArrayBuffer
//             {
//                 headers: {
//                     Authorization: `Bearer ${API_KEY}`,
//                     "Content-Type": "application/octet-stream",
//                 },
//                 timeout: 60000, // 60 seconds timeout
//             }
//         );
//
//         console.log('Received response from Hugging Face:', response.data);
//
//         // Process the response to identify the highest emotion
//         const processedResponse = processResponse(response.data);
//         return processedResponse;
//     } catch (error) {
//         console.error('Error querying the Hugging Face API:', error);
//         throw error;
//     }
// };
//
// const processResponse = (data) => {
//     if (!Array.isArray(data) || data.length === 0) {
//         throw new Error("Invalid API response format");
//     }
//
//     // Find the highest emotion
//     const highestEmotion = data.reduce((prev, current) =>
//         current.score > prev.score ? current : prev, data[0]);
//
//     return {
//         emotions: data,
//         highestEmotion,
//     };
// };
//
// export default query;
