import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';  // Import SecureStore from Expo

// Define the base URL as a constant
const BASE_URL = 'http://192.168.1.101:5000'; // Replace with your IP address or localhost based on your setup

const API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';
const API_KEY = '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';  // Replace with your actual Hugging Face API key

const ChatSessionScreen = ({ route }) => {
    const { sessionId } = route.params;
    const [session, setSession] = useState(null);
    const [averageSentiment, setAverageSentiment] = useState(null); // State for average sentiment score

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');  // Retrieve JWT token from SecureStore
                const response = await axios.get(`${BASE_URL}/sessions/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`  // Include token in Authorization header
                    }
                });  // Fetch chat session data
                const sessionData = response.data;
                setSession(sessionData);

                // Calculate average sentiment score for user messages using Hugging Face API
                const userMessages = sessionData.messages.filter(msg => msg.sender === 'You');
                const scores = await Promise.all(userMessages.map(msg => analyzeSentiment(msg.text))); // Analyze sentiment for each message
                const validScores = scores.filter(score => score !== null); // Filter out null values
                const averageScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
                setAverageSentiment(averageScore);

            } catch (error) {
                console.error("Error fetching chat session", error);
            }
        };

        fetchSession();
    }, [sessionId]);

    // Function to analyze sentiment using Hugging Face API
    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(API_URL, {
                inputs: text,
            }, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });

            const data = response.data;

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const sentiments = data[0];

                // Extract sentiment scores safely
                const positive = sentiments.find(s => s.label.toLowerCase() === 'positive');
                const neutral = sentiments.find(s => s.label.toLowerCase() === 'neutral');
                const negative = sentiments.find(s => s.label.toLowerCase() === 'negative');

                if (positive && negative) {
                    // Convert to a single score: Positive (1), Neutral (0), Negative (-1)
                    const sentimentScore = positive.score - negative.score;
                    return sentimentScore;
                }
            }

            // If data format is unexpected or analysis fails, log the response and return null
            console.error("Unexpected response format:", data);
            return null;
        } catch (error) {
            console.error("Error analyzing sentiment", error);
            return null; // Return null if an error occurs
        }
    };

    // Function to convert average sentiment score to a user-friendly label
    const getSentimentLabel = (score) => {
        if (score > 0.5) return 'Very Positive 😊';
        if (score > 0) return 'Positive 🙂';
        if (score === 0) return 'Neutral 😐';
        if (score > -0.5) return 'Negative 🙁';
        return 'Very Negative 😞';
    };

    if (!session) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat Session {session.id}</Text>

            {/* Display average sentiment score and label */}
            {averageSentiment !== null && (
                <View style={styles.sentimentContainer}>
                    <Text style={styles.sentimentText}>
                        Average Sentiment: {averageSentiment.toFixed(2)} ({getSentimentLabel(averageSentiment)})
                    </Text>
                </View>
            )}

            <FlatList
                data={session.messages}
                renderItem={({ item }) => (
                    <View style={item.sender === 'You' ? styles.userMessage : styles.botMessage}>
                        <Text style={item.sender === 'You' ? styles.messageText : styles.botMessageText}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    sentimentContainer: {
        marginVertical: 16,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    sentimentText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1e7dd',
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
    },
    messageText: {
        fontSize: 16,
    },
    botMessageText: {
        fontSize: 16,
        color: '#555',
    },
});

export default ChatSessionScreen;
