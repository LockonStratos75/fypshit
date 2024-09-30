// SanityLevelScreen.js

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Alert,
    Switch,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';
import { TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ArrowsClockwise } from 'phosphor-react-native';
import CustomPicker from '../components/CustomPicker';
import { getAvailableVoices } from '../services/textToSpeech';

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

    // Voice Settings States
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [audioEncoding, setAudioEncoding] = useState('LINEAR16'); // Default encoding
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);

    // Fetch data when the component mounts
    useEffect(() => {
        fetchSanityData();
        fetchVoices();
        loadSettings();
    }, []);

    // Function to fetch voices
    const fetchVoices = async () => {
        try {
            const availableVoices = await getAvailableVoices();
            setVoices(availableVoices);
            console.log(voices);

            // Check if 'en-US-Journey-D' is available
            const defaultVoiceName = 'Journey';
            const defaultVoice = availableVoices.find(
                (voice) => voice.name === defaultVoiceName
            );

            if (defaultVoice) {
                setSelectedVoice(defaultVoice.name);
            } else if (availableVoices.length > 0) {
                setSelectedVoice(availableVoices[0].name); // Default to first voice
            }
            console.log(selectedVoice);
        } catch (error) {
            Alert.alert('Error', 'Failed to load voices.');
        }
    };

    // Function to load settings from SecureStore
    const loadSettings = async () => {
        try {
            const storedVoice = await SecureStore.getItemAsync('selectedVoice');
            const storedEncoding = await SecureStore.getItemAsync('audioEncoding');
            const storedIsTtsEnabled = await SecureStore.getItemAsync('isTtsEnabled');
            if (storedVoice !== null) setSelectedVoice(storedVoice);
            if (storedEncoding !== null) setAudioEncoding(storedEncoding);
            if (storedIsTtsEnabled !== null)
                setIsTtsEnabled(storedIsTtsEnabled === 'true');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Function to save selected voice
    const handleVoiceChange = async (voice) => {
        setSelectedVoice(voice);
        try {
            await SecureStore.setItemAsync('selectedVoice', voice);
        } catch (error) {
            console.error('Error saving selected voice:', error);
        }
    };

    // Function to save audio encoding
    const handleEncodingChange = async (encoding) => {
        setAudioEncoding(encoding);
        try {
            await SecureStore.setItemAsync('audioEncoding', encoding);
        } catch (error) {
            console.error('Error saving audio encoding:', error);
        }
    };

    // Function to save TTS toggle state
    const handleTtsToggle = async (value) => {
        setIsTtsEnabled(value);
        try {
            await SecureStore.setItemAsync('isTtsEnabled', value.toString());
        } catch (error) {
            console.error('Error saving TTS enabled state:', error);
        }
    };

    // Voice and Encoding Items for Picker
    const voiceItems = voices.map((voice) => ({
        label: `${voice.name} (${voice.ssmlGender})`,
        value: voice.name,
    }));

    const encodingItems = [
        { label: 'LINEAR16 (WAV)', value: 'LINEAR16' },
        { label: 'MULAW', value: 'MULAW' },
        // Add more encodings if needed
    ];

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

            // **Filter out SER results with 'unknown' emotions**
            const validSerResults = serResults.filter(result => {
                const label = result.highestEmotion?.label?.toLowerCase();
                return label && label !== 'unknown';
            });

            // Check for missing data
            const isSentimentEmpty = !Array.isArray(sentimentScores) || sentimentScores.length === 0;
            const isSEREmpty = !Array.isArray(validSerResults) || validSerResults.length === 0;

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
                // Both datasets have valid data, proceed to calculate sanity level
                // Calculate average sentiment score
                const averageSentiment = calculateAverageSentiment(sentimentScores);
                console.log("Average Sentiment:", averageSentiment);

                // Calculate average SER score using validSerResults
                const averageSER = calculateAverageSER(validSerResults);
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
            const response = await axios.get(`${BASE_URL}/sanity/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const { sanityPercentage } = response.data;
                console.log('Fetched sanityPercentage:', sanityPercentage);
                setSanityLevel(sanityPercentage);
            } else {
                setSanityLevel(null);
            }
        } catch (error) {
            console.error('Error fetching stored sanity level:', error.message);
            if (error.response) {
                setDataMissingMessage(error.response.data.message || 'Failed to fetch stored sanity level.');
            } else {
                setDataMissingMessage('Network error while fetching sanity level.');
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
                                    strokeDashoffset={
                                        CIRCUMFERENCE - (sanityLevel / 100) * CIRCUMFERENCE
                                    }
                                    strokeLinecap="round"
                                    rotation="-90"
                                    origin={`${SIZE / 2}, ${SIZE / 2}`}
                                />
                            </Svg>
                            {/* Percentage and Label */}
                            <View style={styles.percentageContainer}>
                                <Text style={styles.percentageText}>
                                    {sanityLevel.toFixed(2)}%
                                </Text>
                                <Text style={styles.labelText}>
                                    {getSanityLabel(sanityLevel)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.missingDataText}>
                            No sanity data available. Start interacting to see your sanity
                            level.
                        </Text>
                    )}
                </>
            )}

            {/* Refresh Button */}
            <TouchableOpacity
                onPress={handleRefresh}
                disabled={isRefreshing}
                style={styles.refreshButton}
            >
                {isRefreshing ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                    <ArrowsClockwise size={28} weight="fill" />
                )}
            </TouchableOpacity>

            {/* Voice Settings and TTS Toggle */}
            <View style={styles.settingsContainer}>
                <CustomPicker
                    label="Select Voice:"
                    selectedValue={selectedVoice}
                    onValueChange={handleVoiceChange}
                    items={voiceItems}
                />
                <CustomPicker
                    label="Select Audio Encoding:"
                    selectedValue={audioEncoding}
                    onValueChange={handleEncodingChange}
                    items={encodingItems}
                />
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>Enable Text-to-Speech</Text>
                    <Switch value={isTtsEnabled} onValueChange={handleTtsToggle} thumbColor={'#164D82'} trackColor={{ false: '#767577', true: '#256eaf' }} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 40, // Adjust this to move the circle up
        backgroundColor: '#fff',
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
        marginTop: 0, // Adjust this to move the circle up
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
    refreshButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    settingsContainer: {
        width: '80%',
        marginTop: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#555',
    },
    missingDataText: {
        fontSize: 16,
        color: '#f44336', // Red color to indicate alert
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default SanityLevelScreen;
