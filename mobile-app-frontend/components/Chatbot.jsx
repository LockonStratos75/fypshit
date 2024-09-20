// Chatbot.js

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, Alert, ActivityIndicator } from 'react-native';
import { styles } from "../App";
import TypingIndicator from '../components/TypingIndicator';
import { LinearGradient } from "expo-linear-gradient";
import { FileArrowUp, PaperPlaneRight, TrashSimple } from "phosphor-react-native";
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import Voice from '@react-native-voice/voice';
import { decode } from 'he';
import { MarkdownView } from 'react-native-markdown-view';
import CustomPicker from './CustomPicker'; // Import CustomPicker
import { getSpeech, getAvailableVoices } from '../services/textToSpeech'; // Import TTS functions
import { Audio } from 'expo-av'; // Import Audio

import {
    GOOGLE_API_KEY,
    HUGGING_FACE_API_KEY,
    IP_ADDRESS,
} from '@env';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = GOOGLE_API_KEY;  // Replace with your actual API key

const sysInstruct = `As Eunoia, a compassionate and understanding mental health therapist with decades of experience, engage with users in their 20s and 30s seeking guidance on motivation, career, and self-esteem. Provide responses that are empathetic, concise, and emotionally supportive. Use a warm and friendly tone, and keep your messages short and relatable. Before giving specific advice, ask thoughtful questions to better understand the user's situation and tailor your guidance accordingly.`;

const API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef();
    const [isBotTyping, setIsBotTyping] = useState(false);
    const route = useRoute();
    const { onNewSession } = route.params || {};
    const [recordButton, setRecordButton] = useState(require('../icons/microphone-fill.png'));
    const [results, setResults] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [chat, setChat] = useState(null);

    // TTS States
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [audioEncoding, setAudioEncoding] = useState('LINEAR16'); // Default encoding
    const [ttsLoading, setTtsLoading] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            Alert.alert("Speech recognition is not supported on web yet.");
        }

        // Initialize Google Generative AI Model
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: sysInstruct,
        });

        const generationConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 256,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history: [],
        });
        setChat(chatSession);

        // Initialize voice recognition event handlers
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;

        // Fetch available voices for TTS
        const fetchVoices = async () => {
            try {
                const availableVoices = await getAvailableVoices();
                setVoices(availableVoices);
                if (availableVoices.length > 0) {
                    setSelectedVoice(availableVoices[0].name); // Default to first voice
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to load voices.');
            }
        };

        fetchVoices();

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const voiceItems = voices.map((voice) => ({
        label: `${voice.name} (${voice.ssmlGender})`,
        value: voice.name,
    }));

    const encodingItems = [
        { label: 'LINEAR16 (WAV)', value: 'LINEAR16' },
        { label: 'MULAW', value: 'MULAW' },
        // Add more encodings if needed
    ];

    const onSpeechStart = (e) => {
        console.log('onSpeechStart: ', e);
    };

    const onSpeechResults = (e) => {
        console.log('onSpeechResults: ', e);
        setResults(e.value);
        setInput(e.value[0]);
    };

    const onSpeechEnd = (e) => {
        console.log('onSpeechEnd: ', e);
        setIsRecording(false);
        setRecordButton(require('../icons/microphone-fill.png'));
    };

    const onSpeechError = (e) => {
        console.log('onSpeechError: ', e);
        setIsRecording(false);
        setRecordButton(require('../icons/microphone-fill.png'));
        Alert.alert('Error', 'Speech recognition error. Please try again.');
    };

    const startRecognizing = async () => {
        try {
            await Voice.start('en-US');
            setIsRecording(true);
            setResults([]);
        } catch (error) {
            console.error('Error starting voice recognition: ', error);
            Alert.alert('Error', 'Failed to start voice recognition.');
        }
    };

    const stopRecognizing = async () => {
        try {
            await Voice.stop();
            setIsRecording(false);
        } catch (error) {
            console.error('Error stopping voice recognition: ', error);
            Alert.alert('Error', 'Failed to stop voice recognition.');
        }
    };

    const RecordButtonHandler = () => {
        if (!isRecording) {
            setRecordButton(require('../icons/stop-fill.png'));
            startRecognizing();
        } else {
            setRecordButton(require('../icons/microphone-fill.png'));
            stopRecognizing();
        }
    };

    // Updated parseMarkdown function
    const parseMarkdown = (text) => {
        // Decode any HTML entities
        const decodedText = decode(text);

        return (
            <MarkdownView
                styles={{
                    paragraph: { marginTop: 0, marginBottom: 0 },
                    strong: { fontWeight: 'bold' },
                    em: { fontStyle: 'italic' },
                    listItemBullet: { fontSize: 12 },
                    listItemNumber: { fontSize: 12 },
                    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
                    listItemContent: { flex: 1 },
                }}
            >
                {decodedText}
            </MarkdownView>
        );
    };

    const extractText = (jsxElement) => {
        if (typeof jsxElement === 'string') {
            return jsxElement;
        }

        if (Array.isArray(jsxElement.props.children)) {
            return jsxElement.props.children.map(child => extractText(child)).join('');
        }

        return extractText(jsxElement.props.children);
    };

    // Function to analyze sentiment using Hugging Face API
    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(API_URL, {
                inputs: text,
            }, {
                headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` }
            });

            const data = response.data;

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const sentiments = data[0];

                // Extract sentiment scores safely
                const positive = sentiments.find(s => s.label.toLowerCase() === 'positive');
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

    const saveChatSession = async () => {
        const sessionId = `session-${Date.now()}`;
        const sessionData = {
            id: sessionId,
            date: new Date().toLocaleDateString(),
            messages: messages.map(message => ({
                text: typeof message.text === 'string' ? message.text : extractText(message.text),
                sender: message.sender
            }))
        };

        try {
            const token = await SecureStore.getItemAsync('token');  // Retrieve JWT token from SecureStore

            // Save the chat session to the server
            const response = await axios.post(`${IP_ADDRESS}/sessions`, sessionData, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Include token in Authorization header
                }
            });

            Alert.alert("Success", "Chat session saved successfully!");
            if (onNewSession) {
                onNewSession(response.data);
            }

            // Analyze and save sentiment score
            const userMessages = messages.filter(msg => msg.sender === 'You');
            const sentimentScores = await Promise.all(userMessages.map(msg => analyzeSentiment(msg.text)));
            const validScores = sentimentScores.filter(score => score !== null);
            const averageSentimentScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

            // Save the sentiment score to MongoDB
            await saveSentimentScore(response.data._id, sessionData.id, averageSentimentScore, token);

        } catch (error) {
            console.error("Error saving chat session", error.response ? error.response.data : error.message);
            Alert.alert("Error", "Error saving chat session.");
        }
    };

    // Function to save the sentiment score to MongoDB
    const saveSentimentScore = async (sessionId, sessionName, averageSentiment, token) => {
        try {
            const response = await axios.post(`${IP_ADDRESS}/sentiment`, {
                sessionId: sessionId,
                sessionName: sessionName,
                averageSentiment: averageSentiment,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Include token in Authorization header
                }
            });
            console.log("Sentiment score saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving sentiment score", error);
        }
    };

    const clearChatHistory = () => {
        setMessages([]);
        setInput('');
    };

    // Function to play bot response using TTS
    const playBotResponse = async (text) => {
        if (!text.trim()) {
            return;
        }

        setTtsLoading(true);
        try {
            const audioContent = await getSpeech(text, selectedVoice, audioEncoding);

            let mimeType;
            if (audioEncoding === 'LINEAR16') {
                mimeType = 'audio/wav'; // LINEAR16 is typically wrapped in WAV
            } else if (audioEncoding === 'MULAW') {
                mimeType = 'audio/mulaw';
            } else {
                mimeType = 'audio/mp3'; // Fallback
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: `data:${mimeType};base64,${audioContent}` },
                { shouldPlay: true }
            );

            // Optionally, handle sound lifecycle
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to synthesize speech.');
        } finally {
            setTtsLoading(false);
        }
    };

    const handleSend = useCallback(async () => {
        if (input.trim()) {
            const newMessages = [...messages, { text: input, sender: 'You' }];
            setMessages(newMessages);
            setIsBotTyping(true);

            try {
                const result = await chat.sendMessage(input.trim());
                setIsBotTyping(false);
                const botMessageText = result.response.text();

                // Use parseMarkdown to render formatted text
                const formattedMessage = parseMarkdown(botMessageText);

                newMessages.push({ text: formattedMessage, sender: 'Bot' });
                setMessages([...newMessages]);
                setInput('');

                // Play the bot's response using TTS
                playBotResponse(botMessageText);
            } catch (error) {
                console.error("Error with Gemini API response:", error);
                setIsBotTyping(false);
            }
        }
    }, [input, messages, chat, selectedVoice, audioEncoding]);

    return (
        <View style={[styles.botContainer]}>
            {/* Optional: Voice Selection and Audio Encoding Pickers */}
            <View style={{ padding: 10 }}>
                <CustomPicker
                    label="Select Voice:"
                    selectedValue={selectedVoice}
                    onValueChange={setSelectedVoice}
                    items={voiceItems}
                />

                <CustomPicker
                    label="Select Audio Encoding:"
                    selectedValue={audioEncoding}
                    onValueChange={setAudioEncoding}
                    items={encodingItems}
                />
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.messageContainer}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}
                    >
                        {typeof msg.text === 'string' ? (
                            <Text
                                style={msg.sender === 'You' ? styles.messageText : styles.botMessageText}
                            >
                                {msg.text}
                            </Text>
                        ) : (
                            msg.text
                        )}
                    </View>
                ))}
                {isBotTyping && (
                    <View style={styles.botMessage}>
                        <TypingIndicator />
                    </View>
                )}
                {ttsLoading && (
                    <View style={{ marginTop: 10, alignItems: 'center' }}>
                        <Text>Playing audio...</Text>
                        <ActivityIndicator size="small" color="#0000ff" />
                    </View>
                )}
            </ScrollView>
            <View style={[styles.wrapper2, styles.rowDirection]}>
                <View style={[styles.smallInput, styles.rowDirection]}>
                    <TextInput
                        onChangeText={setInput}
                        value={input}
                        placeholder="Type your message here..."
                        multiline={true}
                        style={{ width: 150, marginRight: 20 }}
                    />
                    <TouchableOpacity onPress={() => saveChatSession()}>
                        <FileArrowUp size={25} color="#212529" weight="fill" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => clearChatHistory()}>
                        <TrashSimple size={25} color="red" weight="fill" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => RecordButtonHandler()}>
                        <Image source={recordButton} style={styles.iconImg} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => handleSend()}>
                    <LinearGradient
                        colors={['#247C8A', '#164D82']}
                        style={styles.circleButton}
                    >
                        <PaperPlaneRight size={24} color="#ffffff" weight="fill" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Chatbot;
