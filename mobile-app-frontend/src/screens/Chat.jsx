// Chat.js

import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, TouchableOpacity, Image, Modal, View, Text, StyleSheet, Alert, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Chatbot from '../components/Chatbot';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import {IP_ADDRESS, HUGGING_FACE_API_KEY} from '@env';

import {getAvailableVoices} from '../services/textToSpeech'; // Import the function to get voices
import CustomPicker from '../components/CustomPicker'; // Import CustomPicker component
import {ButtonComponent} from "../components/ButtonComponent";


export function Chat() {
    const chatbotRef = useRef();
    const navigation = useNavigation();
    const [isMenuVisible, setMenuVisible] = useState(false);

    // TTS States
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [audioEncoding, setAudioEncoding] = useState('LINEAR16'); // Default encoding
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const [isVoiceSettingsModalVisible, setVoiceSettingsModalVisible] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={{marginRight: 15}}>
                    <Image
                        source={require('../../assets/list-bold.png')} // Ensure the path is correct
                        style={{width: 24, height: 24}}
                    />
                </TouchableOpacity>
            ),
        });

        // Load voices and settings when component mounts
        fetchVoices();
        loadSettings();
    }, [navigation]);

    // Function to fetch voices
    const fetchVoices = async () => {
        try {
            const availableVoices = await getAvailableVoices();
            setVoices(availableVoices);

            // Check if 'Journey' is available
            const defaultVoiceName = 'Journey';
            const defaultVoice = availableVoices.find(
                (voice) => voice.name === defaultVoiceName
            );

            if (defaultVoice) {
                setSelectedVoice(defaultVoice);
            } else if (availableVoices.length > 0) {
                setSelectedVoice(availableVoices[0]);
            }
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

            let parsedVoice = null;
            if (storedVoice) {
                if (storedVoice.trim().startsWith('{') || storedVoice.trim().startsWith('[')) {
                    // Stored as JSON string
                    parsedVoice = JSON.parse(storedVoice);
                } else {
                    console.warn('Stored voice is in legacy format (plain string). Updating to new format.');
                    parsedVoice = null;
                    await SecureStore.deleteItemAsync('selectedVoice');
                }
            }

            setSelectedVoice(parsedVoice || null);
            setAudioEncoding(storedEncoding || 'LINEAR16');
            setIsTtsEnabled(storedIsTtsEnabled === 'true');

            if (!parsedVoice) {
                Alert.alert(
                    'Voice Selection Required',
                    'Please select a voice for Text-to-Speech in your settings.',
                    [{text: 'OK'}]
                );
            }
        } catch (error) {
            console.error('Error loading TTS settings:', error);
        }
    };

    // Function to save selected voice
    const handleVoiceChange = async (voiceName) => {
        // Find the full voice object based on the selected voice name
        const selectedVoiceObject = voices.find((voice) => voice.name === voiceName);

        if (selectedVoiceObject) {
            setSelectedVoice(selectedVoiceObject);
            try {
                await SecureStore.setItemAsync('selectedVoice', JSON.stringify(selectedVoiceObject));
            } catch (error) {
                console.error('Error saving selected voice:', error);
            }
        } else {
            console.error('Selected voice not found in voices array');
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

    // Voice Items for Picker
    const voiceItems = voices.map((voice) => ({
        label: `${voice.name} (${voice.ssmlGender})`,
        value: voice.name,
    }));

    // Function to analyze sentiment (moved from Chatbot.js)
    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
                {inputs: text},
                {headers: {Authorization: `Bearer ${HUGGING_FACE_API_KEY}`}}
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
                {sessionId, sessionName, averageSentiment},
                {headers: {Authorization: `Bearer ${token}`}}
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
                headers: {Authorization: `Bearer ${token}`},
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

    return (
        <SafeAreaView style={{flex: 1}}>
            <Chatbot
                ref={chatbotRef}
                selectedVoice={selectedVoice}
                audioEncoding={audioEncoding}
                isTtsEnabled={isTtsEnabled}
            />

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
                        <TouchableOpacity onPress={() => {
                            setVoiceSettingsModalVisible(true);
                            setMenuVisible(false);
                        }} style={styles.menuItem}>
                            <Text style={styles.menuText}>Voice Settings</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Voice Settings Modal */}
            <Modal
                visible={isVoiceSettingsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setVoiceSettingsModalVisible(false)}
            >
                <View style={styles.voiceSettingsModal}>
                    <View style={styles.voiceSettingsContainer}>
                        <Text style={styles.modalTitle}>Voice Settings</Text>
                        <CustomPicker
                            label="Select Voice:"
                            selectedValue={selectedVoice ? selectedVoice.name : ''}
                            onValueChange={handleVoiceChange}
                            items={voiceItems}
                        />
                        <View style={styles.toggleContainer}>
                            <Text style={styles.toggleLabel}>Enable Text-to-Speech</Text>
                            <Switch
                                value={isTtsEnabled}
                                onValueChange={handleTtsToggle}
                                thumbColor={'#164D82'}
                                trackColor={{false: '#767577', true: '#256eaf'}}
                            />
                        </View>
                        <ButtonComponent
                            onPress={() => setVoiceSettingsModalVisible(false)}
                            title={'Close'}
                        />
                    </View>
                </View>
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
        shadowOffset: {width: 0, height: 2},
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
    voiceSettingsModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceSettingsContainer: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        // Shadows for iOS and Android
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    closeButton: {
        marginTop: 20,
        backgroundColor: '#164D82',
        paddingVertical: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
});
