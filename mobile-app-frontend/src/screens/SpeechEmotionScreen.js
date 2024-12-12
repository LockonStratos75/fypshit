import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import query from '../config/SpeechEmotionRecognition';
import { ButtonComponent } from "../components/ButtonComponent";
import { IP_ADDRESS } from '@env';

export const SpeechEmotionScreen = ({ navigation }) => {
    const [result, setResult] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // New loading state

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            setLoading(true); // Start loading
            setResult(null);  // Clear previous results
            setError(null);   // Clear previous errors

            const permission = await Audio.requestPermissionsAsync();

            if (permission.status !== 'granted') {
                console.log('Permission to access microphone is required!');
                setError('Permission to access microphone is required!');
                setLoading(false); // Stop loading
                return;
            }

            console.log('Starting recording..');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
                isMeteringEnabled: true,
                android: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
            });

            await recording.startAsync();
            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            setError('Failed to start recording: ' + err.message);
            setLoading(false); // Stop loading
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
        } catch (stopError) {
            console.error('Error stopping recording', stopError);
            setError('Error stopping recording: ' + stopError.message);
            setLoading(false); // Stop loading
            return;
        }

        const uri = recording.getURI();
        setRecording(null);
        console.log('Recording stopped and stored at', uri);

        try {
            // Check file size to ensure it's not empty
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('File info:', fileInfo);

            if (!fileInfo.exists || fileInfo.size < 4000) { // Adjust size threshold based on expected audio
                setError('Recording is empty. Please try again.');
                setLoading(false); // Stop loading
                return;
            }

            console.log('Calling query function with URI:', uri);
            const response = await query(uri);
            console.log('Response from query:', response);

            const emotions = processResponse(response);

            if (emotions && emotions.highestEmotion.label !== 'unknown') {
                setResult(emotions);
                // Retrieve token from SecureStore
                const token = await SecureStore.getItemAsync('token');
                if (!token) {
                    setError('User is not authenticated.');
                    setLoading(false); // Stop loading
                    return;
                }
                // Save SER results to the server
                await saveSERResultToServer(emotions, token);
            } else {
                console.log('Highest emotion is unknown. Result not saved or displayed.');
                setResult(null);
                if (emotions && emotions.highestEmotion.label === 'unknown') {
                    setError('Unable to determine emotion.');
                }
            }
        } catch (error) {
            console.error('Failed to process recording', error);
            setError('Failed to process recording: ' + error.message);
        } finally {
            setLoading(false); // Stop loading after processing
        }
    };


    const processResponse = (response) => {
        if (!response || !response.emotions || !response.highestEmotion) {
            console.error('Invalid response format:', response);
            setError('Invalid response format');
            return null;
        }

        const emotions = response.emotions;
        const highestEmotion = response.highestEmotion;

        // Calculate percentages
        const totalScore = emotions.reduce((sum, emotion) => sum + emotion.score, 0);
        const emotionsWithPercentage = emotions.map((emotion) => ({
            ...emotion,
            percentage: ((emotion.score / totalScore) * 100).toFixed(2),
        }));

        return {
            highestEmotion,
            emotions: emotionsWithPercentage,
        };
    };

    const saveSERResultToServer = async (emotions, token) => {
        try {
            const response = await axios.post(`${IP_ADDRESS}/ser`, {
                highestEmotion: emotions.highestEmotion,
                emotions: emotions.emotions,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include token in Authorization header
                }
            });
            console.log("SER result saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving SER result", error);
            setError('Error saving SER result: ' + error.message);
        }
    };

    return (
        <SafeAreaView style={styles.wrapperCenter}>
            <View>
                {loading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
                {!loading && result && (
                    <View>
                        <Text style={styles.h1Center}>You sounded {result.highestEmotion.label}!</Text>
                        {result.emotions.map((emotion, index) => (
                            <Text key={index} style={styles.bodyText2}>
                                {emotion.label}: {emotion.percentage}%
                            </Text>
                        ))}
                    </View>
                )}
                {!loading && error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
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

