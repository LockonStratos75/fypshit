// frontend/screens/SanityLevelScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';
import { ButtonComponent } from "../components/ButtonComponent";
import Svg, { Circle } from 'react-native-svg';

const BASE_URL = `${IP_ADDRESS}`; // Ensure the port matches your server's

const { width } = Dimensions.get('window');
const SIZE = width * 0.6; // Adjust the size as needed
const STROKE_WIDTH = 15;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SanityLevelScreen = () => {
    const [sanityLevel, setSanityLevel] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator
    const [isRefreshing, setIsRefreshing] = useState(false); // State to manage refresh button
    const [dataMissingMessage, setDataMissingMessage] = useState(null); // State to handle missing data messages

    // Fetch data when the component mounts
    useEffect(() => {
        fetchSanityData();
    }, []);

    // Function to fetch sanity data and update backend
    const fetchSanityData = async () => {
        try {
            console.log("Starting fetchSanityData");
            setIsLoading(true);
            setDataMissingMessage(null); // Reset any previous messages
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                console.error("No token found");
                setIsLoading(false);
                setIsRefreshing(false);
                setDataMissingMessage("Authentication token is missing. Please log in again.");
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
            console.log("Sentiment response data structure:", JSON.stringify(sentimentResponse.data, null, 2));
            // Adjust based on actual structure
            const sentimentScores = Array.isArray(sentimentResponse.data)
                ? sentimentResponse.data
                : sentimentResponse.data.scores || []; // Replace 'scores' with actual key

            // Fetch SER results
            console.log("Fetching SER results...");
            const serResponse = await axios.get(`${BASE_URL}/ser`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("SER response status:", serResponse.status);
            console.log("SER response data structure:", JSON.stringify(serResponse.data, null, 2));
            // Adjust based on actual structure
            const serResults = Array.isArray(serResponse.data)
                ? serResponse.data
                : serResponse.data.results || []; // Replace 'results' with actual key

            // Check for missing data
            const isSentimentEmpty = !Array.isArray(sentimentScores) || sentimentScores.length === 0;
            const isSEREmpty = !Array.isArray(serResults) || serResults.length === 0;

            if (isSentimentEmpty && isSEREmpty) {
                setDataMissingMessage("No Sentiment or SER data available. Please interact more to generate data.");
                setSanityLevel(null);
            } else if (isSentimentEmpty) {
                setDataMissingMessage("No Sentiment data available. Please interact more to generate Sentiment data.");
                setSanityLevel(null);
            } else if (isSEREmpty) {
                setDataMissingMessage("No SER data available. Please interact more to generate SER data.");
                setSanityLevel(null);
            } else {
                // Both datasets have data, proceed to calculate sanity level
                // Calculate average sentiment score
                const averageSentiment = calculateAverageSentiment(sentimentScores);
                console.log("Average Sentiment:", averageSentiment);

                // Calculate average SER score
                const averageSER = calculateAverageSER(serResults);
                console.log("Average SER:", averageSER);

                // Compute overall sanity score
                const overallSanityScore = (averageSentiment * 0.7) + (averageSER * 0.3);
                console.log("Overall Sanity Score:", overallSanityScore);

                // Convert sanity score to percentage
                const sanityPercentage = mapScoreToPercentage(overallSanityScore);
                console.log("Sanity Percentage:", sanityPercentage);

                // Store/update sanity percentage in the backend
                await storeSanityPercentage(sanityPercentage);

                // Optionally, fetch the stored sanity level to ensure consistency
                await fetchStoredSanityLevel(token);
            }
        } catch (error) {
            console.error("Error fetching sanity data:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Request made but no response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
            setDataMissingMessage("An error occurred while fetching data. Please try again later.");
            setSanityLevel(null);
        } finally {
            console.log("Setting isLoading and isRefreshing to false");
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Function to calculate average sentiment score
    const calculateAverageSentiment = (sentimentScores) => {
        if (!Array.isArray(sentimentScores) || sentimentScores.length === 0) return 0;
        const total = sentimentScores.reduce((sum, score) => sum + (score.averageSentiment || 0), 0);
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
        if (!Array.isArray(serResults) || serResults.length === 0) return 0;
        const total = serResults.reduce((sum, result) => {
            const emotionLabel = (result.highestEmotion?.label || '').toLowerCase();
            const emotionScore = emotionMapping[emotionLabel] || 0;
            return sum + emotionScore;
        }, 0);
        return total / serResults.length;
    };

    // Function to map the overall sanity score to a percentage
    const mapScoreToPercentage = (score) => {
        // Assuming score ranges from -1 to +1
        // Map -1 to 0% and +1 to 100%
        const percentage = ((score + 1) / 2) * 100;
        // Clamp the percentage between 0 and 100
        return Math.max(0, Math.min(100, percentage));
    };

    // Function to convert sanity percentage to a label
    const getSanityLabel = (percentage) => {
        if (percentage > 80) return 'Excellent 😄';
        if (percentage > 60) return 'Very Good 🙂';
        if (percentage > 40) return 'Good 🙂';
        if (percentage > 20) return 'Fair 😐';
        return 'Poor 😞';
    };

    // Function to determine the progress circle color based on sanity percentage
    const getProgressColor = (percentage) => {
        if (percentage > 80) return '#4caf50'; // Green for Excellent
        if (percentage > 60) return '#8bc34a'; // Light Green for Very Good
        if (percentage > 40) return '#ffeb3b'; // Yellow for Good
        if (percentage > 20) return '#ff9800'; // Orange for Fair
        return '#f44336'; // Red for Poor
    };

    // Function to store/update sanity percentage in the backend
    const storeSanityPercentage = async (sanityPercentage) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                setDataMissingMessage("Authentication token is missing. Please log in again.");
                return;
            }

            const response = await axios.post(
                `${BASE_URL}/sanity`,
                { sanityPercentage },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log("Sanity level stored successfully:", response.data);
                // Optionally, you can setSanityLevel here if not fetched again
            }
        } catch (error) {
            console.error("Error storing sanity level:", error.message);
            if (error.response) {
                setDataMissingMessage(error.response.data.message || "Failed to store sanity level.");
            } else {
                setDataMissingMessage("Network error while storing sanity level.");
            }
            setSanityLevel(null);
        }
    };

    // Function to fetch the stored sanity level from the backend
    const fetchStoredSanityLevel = async (token) => {
        try {
            const response = await axios.get(`${BASE_URL}/sanity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const { sanityPercentage } = response.data;
                setSanityLevel(sanityPercentage);
            }
        } catch (error) {
            console.error("Error fetching stored sanity level:", error.message);
            if (error.response) {
                setDataMissingMessage(error.response.data.message || "Failed to fetch stored sanity level.");
            } else {
                setDataMissingMessage("Network error while fetching sanity level.");
            }
            setSanityLevel(null);
        }
    };

    // Handler for the refresh button
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchSanityData();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Sanity Level</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {dataMissingMessage ? (
                        <Text style={styles.missingDataText}>{dataMissingMessage}</Text>
                    ) : sanityLevel !== null ? (
                        <View style={styles.progressContainer}>
                            <Svg width={SIZE} height={SIZE}>
                                {/* Background Circle */}
                                <Circle
                                    stroke="#e6e6e6"
                                    fill="none"
                                    cx={SIZE / 2}
                                    cy={SIZE / 2}
                                    r={RADIUS}
                                    strokeWidth={STROKE_WIDTH}
                                />
                                {/* Progress Circle */}
                                <Circle
                                    stroke={getProgressColor(sanityLevel)}
                                    fill="none"
                                    cx={SIZE / 2}
                                    cy={SIZE / 2}
                                    r={RADIUS}
                                    strokeWidth={STROKE_WIDTH}
                                    strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                                    strokeDashoffset={CIRCUMFERENCE - (sanityLevel / 100) * CIRCUMFERENCE}
                                    strokeLinecap="round"
                                    rotation="-90"
                                    origin={`${SIZE / 2}, ${SIZE / 2}`}
                                />
                            </Svg>
                            {/* Percentage and Label */}
                            <View style={styles.percentageContainer}>
                                <Text style={styles.percentageText}>{sanityLevel.toFixed(2)}%</Text>
                                <Text style={styles.labelText}>{getSanityLabel(sanityLevel)}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.missingDataText}>
                            No sanity data available. Start interacting to see your sanity level.
                        </Text>
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
        alignItems: 'center', // Center horizontally
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    percentageContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    labelText: {
        fontSize: 16,
        color: '#555',
        marginTop: 4,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: 20,
        alignSelf: 'center',
        width: '50%',
    },
    missingDataText: {
        fontSize: 16,
        color: '#f44336', // Red color to indicate alert
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default SanityLevelScreen;
