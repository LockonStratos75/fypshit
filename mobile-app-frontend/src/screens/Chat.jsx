import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, Image, Modal, View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Chatbot from '../components/Chatbot';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { IP_ADDRESS, HUGGING_FACE_API_KEY } from '@env';

export function Chat() {
    const chatbotRef = useRef();
    const navigation = useNavigation();
    const [isMenuVisible, setMenuVisible] = useState(false);

    // Function to analyze sentiment (moved from Chatbot.js)
    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
                { inputs: text },
                { headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` } }
            );

            const data = response.data;

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const sentiments = data[0];

                const positive = sentiments.find((s) => s.label.toLowerCase() === 'positive');
                const negative = sentiments.find((s) => s.label.toLowerCase() === 'negative');

                if (positive && negative) {
                    const sentimentScore = positive.score - negative.score;
                    return sentimentScore;
                }
            }

            console.error('Unexpected response format:', data);
            return null;
        } catch (error) {
            console.error('Error analyzing sentiment', error);
            return null;
        }
    };

    const saveSentimentScore = async (sessionId, sessionName, averageSentiment, token) => {
        try {
            const response = await axios.post(
                `${IP_ADDRESS}/sentiment`,
                { sessionId, sessionName, averageSentiment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Sentiment score saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving sentiment score', error);
        }
    };

    const handleSaveChatSession = async () => {
        console.log('handleSaveChatSession called');
        const messages = chatbotRef.current?.getMessages();
        if (!messages || messages.length === 0) {
            Alert.alert('No messages', 'There are no messages to save.');
            setMenuVisible(false);
            return;
        }

        const sessionId = `session-${Date.now()}`;
        const sessionData = {
            id: sessionId,
            date: new Date().toLocaleDateString(),
            messages: messages.map((message) => ({
                text: typeof message.text === 'string' ? message.text : extractText(message.text),
                sender: message.sender,
            })),
        };

        try {
            const token = await SecureStore.getItemAsync('token');

            const response = await axios.post(`${IP_ADDRESS}/sessions`, sessionData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('Success', 'Chat session saved successfully!');

            // Analyze sentiment
            const userMessages = messages.filter((msg) => msg.sender === 'You');
            const sentimentScores = await Promise.all(userMessages.map((msg) => analyzeSentiment(msg.text)));
            const validScores = sentimentScores.filter((score) => score !== null);
            const averageSentimentScore =
                validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

            await saveSentimentScore(response.data._id, sessionData.id, averageSentimentScore, token);
        } catch (error) {
            console.error('Error saving chat session', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Error saving chat session.');
        }

        setMenuVisible(false);
    };

    const handleClearChatHistory = () => {
        console.log('handleClearChatHistory called');
        chatbotRef.current?.clearMessages();
        setMenuVisible(false);
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
                    <Image
                        source={require('../../assets/list-bold.png')} // Ensure the path is correct
                        style={{ width: 24, height: 24 }}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Chatbot ref={chatbotRef} />

            {/* Menu Modal */}
            <Modal
                visible={isMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity onPress={handleSaveChatSession} style={styles.menuItem}>
                            <Text style={styles.menuText}>Save Chat Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleClearChatHistory} style={styles.menuItem}>
                            <Text style={styles.menuText}>Clear Chat History</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menuContainer: {
        width: 200,
        backgroundColor: '#fff',
        paddingVertical: 10,
        marginTop: 60,
        marginRight: 10,
        borderRadius: 5,
        // Shadows for iOS and Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
});
