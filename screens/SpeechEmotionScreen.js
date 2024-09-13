import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';  // Import SecureStore from Expo
import axios from 'axios';  // Import axios for HTTP requests
import query from '../config/SpeechEmotionRecognition';
import { ButtonComponent } from "../components/ButtonComponent";

const IP_ADDRESS = 'http://192.168.100.90:5000';  // Replace with your server's IP address

export const SpeechEmotionScreen = () => {
    const [result, setResult] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [error, setError] = useState(null);

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            const permission = await Audio.requestPermissionsAsync();

            if (permission.status !== 'granted') {
                console.log('Permission to access microphone is required!');
                return;
            }

            console.log('Starting recording..');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.startAsync();
            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            setError(err.message);
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        console.log('Recording stopped and stored at', uri);

        // Define the target path in the app's cache directory
        const targetPath = `${FileSystem.cacheDirectory}sample1.wav`;

        try {
            // Move the file to the target path
            await FileSystem.moveAsync({
                from: uri,
                to: targetPath,
            });

            // Query the moved file
            const token = await SecureStore.getItemAsync('token');  // Retrieve JWT token from SecureStore
            const response = await query(targetPath, token);  // Pass token to query function
            const emotions = processResponse(response);
            setResult(emotions);

            // Save SER results to the server
            await saveSERResultToServer(emotions, token);

        } catch (error) {
            console.error('Failed to process recording', error);
            setError(error.message);
        }
    };

    const processResponse = (response) => {
        if (!response || !Array.isArray(response) || response.length === 0) {
            console.error('Invalid response format:', response);
            setError('Invalid response format');
            return { highestEmotion: { label: 'unknown', score: 0 }, emotions: [] };
        }

        const sortedEmotions = response.sort((a, b) => b.score - a.score);
        const highestEmotion = sortedEmotions[0];
        const totalScore = sortedEmotions.reduce((sum, emotion) => sum + emotion.score, 0);
        const emotions = sortedEmotions.map((emotion) => ({
            ...emotion,
            percentage: ((emotion.score / totalScore) * 100).toFixed(2),
        }));
        return {
            highestEmotion,
            emotions,
        };
    };

    const saveSERResultToServer = async (emotions, token) => {
        try {
            const response = await axios.post(`${IP_ADDRESS}/ser`, {
                highestEmotion: emotions.highestEmotion,
                emotions: emotions.emotions,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Include token in Authorization header
                }
            });
            console.log("SER result saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving SER result", error);
        }
    };

    return (
        <SafeAreaView style={styles.wrapperCenter}>
            <View>
                {result && (
                    <View>
                        <Text style={styles.h1Center}>You sounded {result.highestEmotion.label}!</Text>
                        {result.emotions.map((emotion, index) => (
                            <Text key={index} style={styles.bodyText2}>
                                {emotion.label}: {emotion.percentage}%
                            </Text>
                        ))}
                    </View>
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
            <ButtonComponent
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={isRecording ? stopRecording : startRecording}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    wrapperCenter: {
        backgroundColor: '#FDFDFD',
        height: '100%',
        alignItems: 'center',
        padding: 20,
        paddingTop: 0,
    },
    h1Center: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 64,
    },
    bodyText2: {
        color: 'black',
        fontSize: 14,
        marginLeft: 20,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 20,
    },
});
