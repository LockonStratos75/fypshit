import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
    IP_ADDRESS,
} from '@env';
import {ButtonComponent} from "../components/ButtonComponent";

const BASE_URL = IP_ADDRESS; // Replace with your server's IP address or hostname

const EmotionLevelScreen = () => {
    const [overallEmotion, setOverallEmotion] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator
    const [isRefreshing, setIsRefreshing] = useState(false); // State to manage refresh button

    // Fetch data when the component mounts
    useEffect(() => {
        fetchEmotionData();
    }, []);

    // Function to fetch emotion data
    const fetchEmotionData = async () => {
        try {
            console.log("Starting fetchEmotionData");
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                console.error("No token found");
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }
            console.log("Token retrieved:", token);

            // Fetch sentiment scores
            console.log("Fetching sentiment scores...");
            const sentimentResponse = await axios.get(`${BASE_URL}/sentiment`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Sentiment response status:", sentimentResponse.status);
            const sentimentScores = sentimentResponse.data;
            console.log("Sentiment Scores:", sentimentScores);

            // Fetch SER results
            console.log("Fetching SER results...");
            const serResponse = await axios.get(`${BASE_URL}/ser`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("SER response status:", serResponse.status);
            const serResults = serResponse.data;
            console.log("SER Results:", serResults);

            // Calculate average sentiment score
            const averageSentiment = calculateAverageSentiment(sentimentScores);
            console.log("Average Sentiment:", averageSentiment);

            // Calculate average SER score
            const averageSER = calculateAverageSER(serResults);
            console.log("Average SER:", averageSER);

            // Compute overall emotion level
            const overallEmotionScore = (averageSentiment * 0.7) + (averageSER * 0.3);
            console.log("Overall Emotion Score:", overallEmotionScore);

            setOverallEmotion(overallEmotionScore);
        } catch (error) {
            console.error("Error fetching emotion data:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Request made but no response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
        } finally {
            console.log("Setting isLoading and isRefreshing to false");
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };


    // Function to calculate average sentiment score
    const calculateAverageSentiment = (sentimentScores) => {
        if (!sentimentScores.length) return 0;
        const total = sentimentScores.reduce((sum, score) => sum + score.averageSentiment, 0);
        return total / sentimentScores.length;
    };

    // Emotion mapping for SER results
    const emotionMapping = {
        'happy': 1,
        'neutral': 0,
        'sad': -1,
        'angry': -0.7,
        'surprised': 0.5,
        'fearful': -0.5,
        'disgusted': -0.8,
        'calm': 0.3,
        // Add other emotions as needed
    };

    // Function to calculate average SER score
    const calculateAverageSER = (serResults) => {
        if (!serResults.length) return 0;
        const total = serResults.reduce((sum, result) => {
            const emotionLabel = result.highestEmotion.label.toLowerCase();
            const emotionScore = emotionMapping[emotionLabel] || 0;
            return sum + emotionScore;
        }, 0);
        return total / serResults.length;
    };

    // Function to convert overall emotion score to a label
    const getEmotionLabel = (score) => {
        if (score > 0.5) return 'Very Positive 😊';
        if (score > 0) return 'Positive 🙂';
        if (score === 0) return 'Neutral 😐';
        if (score > -0.5) return 'Negative 🙁';
        return 'Very Negative 😞';
    };

    // Handler for the refresh button
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchEmotionData();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Overall Emotion Level</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {overallEmotion !== null ? (
                        <View style={styles.emotionContainer}>
                            <Text style={styles.emotionText}>
                                {getEmotionLabel(overallEmotion)} ({overallEmotion.toFixed(2)})
                            </Text>
                        </View>
                    ) : (
                        <Text>No emotion data available. Start interacting to see your emotion level.</Text>
                    )}
                </>
            )}

            {/* Refresh Button */}
            <View style={styles.buttonContainer}>
                <ButtonComponent
                    title={isRefreshing ? "Refreshing..." : "Refresh"}
                    onPress={handleRefresh}
                    disabled={isRefreshing}

                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    emotionContainer: {
        marginVertical: 16,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    emotionText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: 20,
        alignSelf: 'center',
        width: '50%',
    },
});

export default EmotionLevelScreen;
