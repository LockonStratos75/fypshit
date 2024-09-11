import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import Sentiment from 'sentiment';  // Import Sentiment library

const BASE_URL = 'http://10.113.88.141:5000'; // Replace with your IP address or localhost based on your setup

const ChatSessionScreen = ({ route }) => {
    const { sessionId } = route.params;
    const [session, setSession] = useState(null);
    const [averageSentiment, setAverageSentiment] = useState(null); // State for average sentiment score
    const sentimentAnalyzer = new Sentiment();  // Initialize Sentiment instance

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/sessions/${sessionId}`); // Use the base URL variable
                const sessionData = response.data;
                setSession(sessionData);

                // Calculate average sentiment score for user messages
                const userMessages = sessionData.messages.filter(msg => msg.sender === 'You');
                const scores = userMessages.map(msg => sentimentAnalyzer.analyze(msg.text).score);
                const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                setAverageSentiment(averageScore);

            } catch (error) {
                console.error("Error fetching chat session", error);
            }
        };

        fetchSession();
    }, [sessionId]);

    // Function to convert average sentiment score to a user-friendly label
    const getSentimentLabel = (score) => {
        if (score > 2) return 'Very Positive 😊';
        if (score > 0) return 'Positive 🙂';
        if (score === 0) return 'Neutral 😐';
        if (score > -2) return 'Negative 🙁';
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
