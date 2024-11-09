// Chatbot.js

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    Alert,
    ActivityIndicator,
    StyleSheet, // Moved StyleSheet here
    SafeAreaView
} from 'react-native';

import TypingIndicator from '../components/TypingIndicator';
import Voice from '@react-native-voice/voice';
import { decode } from 'he';
import { MarkdownView } from 'react-native-markdown-view';
import { getSpeech } from '../services/textToSpeech'; // Import TTS functions
import { Audio } from 'expo-av'; // Import Audio
import { useRoute, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from '@google/generative-ai';

import { GOOGLE_API_KEY, HUGGING_FACE_API_KEY, IP_ADDRESS } from '@env';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = GOOGLE_API_KEY; // Replace with your actual API key

const sysInstruct = `As Eunoia, a compassionate and understanding mental health therapist with decades of experience, engage with users in their 20s and 30s seeking guidance on motivation, career, and self-esteem. Provide responses that are empathetic, concise, and emotionally supportive. Use a warm and friendly tone, and keep your messages short and relatable. Before giving specific advice, ask thoughtful questions to better understand the user's situation and tailor your guidance accordingly.`;

const API_URL =
    'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const flatListRef = useRef();
    const [isBotTyping, setIsBotTyping] = useState(false);
    const route = useRoute();
    const { onNewSession } = route.params || {};
    const [isRecording, setIsRecording] = useState(false);
    const [chat, setChat] = useState(null);

    // TTS States
    const [selectedVoice, setSelectedVoice] = useState('');
    const [audioEncoding, setAudioEncoding] = useState('LINEAR16'); // Default encoding
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const [ttsLoading, setTtsLoading] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            Alert.alert('Speech recognition is not supported on web yet.');
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

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    // Load TTS settings when the screen is focused
    useFocusEffect(
        useCallback(() => {
            const loadTtsSettings = async () => {
                try {
                    const storedVoice = await SecureStore.getItemAsync('selectedVoice');
                    const storedEncoding = await SecureStore.getItemAsync('audioEncoding');
                    const storedIsTtsEnabled = await SecureStore.getItemAsync('isTtsEnabled');

                    setSelectedVoice(storedVoice || '');
                    setAudioEncoding(storedEncoding || 'LINEAR16');
                    setIsTtsEnabled(storedIsTtsEnabled === 'true');
                } catch (error) {
                    console.error('Error loading TTS settings:', error);
                }
            };

            loadTtsSettings();
        }, [])
    );

    const onSpeechStart = (e) => {
        console.log('onSpeechStart: ', e);
    };

    const onSpeechResults = (e) => {
        console.log('onSpeechResults: ', e);
        setInput(e.value[0]);
    };

    const onSpeechEnd = (e) => {
        console.log('onSpeechEnd: ', e);
        setIsRecording(false);
    };

    const onSpeechError = (e) => {
        console.log('onSpeechError: ', e);
        setIsRecording(false);
        Alert.alert('Error', 'Speech recognition error. Please try again.');
    };

    const startRecognizing = async () => {
        try {
            await Voice.start('en-US');
            setIsRecording(true);
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
            startRecognizing();
        } else {
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
                    listItem: {
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                    },
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
            return jsxElement.props.children.map((child) => extractText(child)).join('');
        }

        return extractText(jsxElement.props.children);
    };

    // Function to analyze sentiment using Hugging Face API
    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(
                API_URL,
                {
                    inputs: text,
                },
                {
                    headers: { Authorization: `Bearer ${HUGGING_FACE_API_KEY}` },
                }
            );

            const data = response.data;

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const sentiments = data[0];

                // Extract sentiment scores safely
                const positive = sentiments.find((s) => s.label.toLowerCase() === 'positive');
                const negative = sentiments.find((s) => s.label.toLowerCase() === 'negative');

                if (positive && negative) {
                    // Convert to a single score: Positive (1), Neutral (0), Negative (-1)
                    const sentimentScore = positive.score - negative.score;
                    return sentimentScore;
                }
            }

            // If data format is unexpected or analysis fails, log the response and return null
            console.error('Unexpected response format:', data);
            return null;
        } catch (error) {
            console.error('Error analyzing sentiment', error);
            return null; // Return null if an error occurs
        }
    };

    const saveChatSession = async () => {
        const sessionId = `session-${Date.now()}`;
        const sessionData = {
            id: sessionId,
            date: new Date().toLocaleDateString(),
            messages: messages.map((message) => ({
                text:
                    typeof message.text === 'string' ? message.text : extractText(message.text),
                sender: message.sender,
            })),
        };

        try {
            const token = await SecureStore.getItemAsync('token'); // Retrieve JWT token from SecureStore

            // Save the chat session to the server
            const response = await axios.post(`${IP_ADDRESS}/sessions`, sessionData, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in Authorization header
                },
            });

            Alert.alert('Success', 'Chat session saved successfully!');
            if (onNewSession) {
                onNewSession(response.data);
            }

            // Analyze and save sentiment score
            const userMessages = messages.filter((msg) => msg.sender === 'You');
            const sentimentScores = await Promise.all(
                userMessages.map((msg) => analyzeSentiment(msg.text))
            );
            const validScores = sentimentScores.filter((score) => score !== null);
            const averageSentimentScore =
                validScores.length > 0
                    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
                    : 0;

            // Save the sentiment score to MongoDB
            await saveSentimentScore(
                response.data._id,
                sessionData.id,
                averageSentimentScore,
                token
            );
        } catch (error) {
            console.error(
                'Error saving chat session',
                error.response ? error.response.data : error.message
            );
            Alert.alert('Error', 'Error saving chat session.');
        }
    };

    // Function to save the sentiment score to MongoDB
    const saveSentimentScore = async (
        sessionId,
        sessionName,
        averageSentiment,
        token
    ) => {
        try {
            const response = await axios.post(
                `${IP_ADDRESS}/sentiment`,
                {
                    sessionId: sessionId,
                    sessionName: sessionName,
                    averageSentiment: averageSentiment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in Authorization header
                    },
                }
            );
            console.log('Sentiment score saved successfully:', response.data);
        } catch (error) {
            console.error('Error saving sentiment score', error);
        }
    };

    const clearChatHistory = () => {
        setMessages([]);
        setInput('');
    };

    // Function to play bot response using TTS
    const playBotResponse = async (text) => {
        if (!text.trim() || !isTtsEnabled) {
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
                console.error('Error with Gemini API response:', error);
                setIsBotTyping(false);
            }
        }
    }, [input, messages, chat, selectedVoice, audioEncoding, isTtsEnabled]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Eunoia Chat</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={saveChatSession}>
                            <Icon name="save" size={24} color="#000" style={styles.headerIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={clearChatHistory}>
                            <Icon name="delete" size={24} color="#000" style={styles.headerIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Wrapper */}
                <View style={styles.contentWrapper}>
                    {/* Messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.messageWrapper,
                                    item.sender === 'You'
                                        ? styles.userMessageWrapper
                                        : styles.botMessageWrapper,
                                ]}
                            >
                                {item.sender !== 'You' && (
                                    <Image
                                        source={require('../../assets/adaptive-icon.png')}
                                        style={styles.avatar}
                                    />
                                )}
                                <View
                                    style={[
                                        styles.messageBubble,
                                        item.sender === 'You' ? styles.userMessage : styles.botMessage,
                                    ]}
                                >
                                    {typeof item.text === 'string' ? (
                                        <Text
                                            style={
                                                item.sender === 'You'
                                                    ? styles.messageText
                                                    : styles.botMessageText
                                            }
                                        >
                                            {item.text}
                                        </Text>
                                    ) : (
                                        item.text
                                    )}
                                </View>
                                {item.sender === 'You' && (
                                    <Image
                                        source={require('../../assets/adaptive-icon.png')}
                                        style={styles.avatar}
                                    />
                                )}
                            </View>
                        )}
                        ref={flatListRef}
                        onContentSizeChange={() =>
                            flatListRef.current.scrollToEnd({ animated: true })
                        }
                        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                        style={styles.messageContainer}
                    />

                    {isBotTyping && (
                        <View style={styles.typingIndicator}>
                            <TypingIndicator />
                        </View>
                    )}

                    {ttsLoading && (
                        <View style={{ marginTop: 10, alignItems: 'center' }}>
                            <Text>Playing audio...</Text>
                            <ActivityIndicator size="small" color="#0000ff" />
                        </View>
                    )}
                </View>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={RecordButtonHandler}>
                        <Icon name={isRecording ? 'stop' : 'mic'} size={28} color="#164D82" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={setInput}
                        value={input}
                        placeholder="Type your message..."
                        multiline={true}
                    />
                    <TouchableOpacity onPress={handleSend}>
                        <Icon name="send" size={28} color="#164D82" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const colors = {
    primary: '#164D82',
    secondary: '#247C8A',
    background: '#FFFFFF',
    botBubble: '#E8E9EB',
    userBubble: '#164D82',
    botText: '#000000',
    userText: '#FFFFFF',
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },

    headerIcons: {
        flexDirection: 'row',
    },

    headerIcon: {
        marginHorizontal: 10,
    },

    contentWrapper: {
        flex: 1,
        marginBottom: 80, // Adjust this value based on your bottom tab bar height
    },

    messageContainer: {
        flex: 1,
    },

    messageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 5,
        paddingHorizontal: 10,
    },

    userMessageWrapper: {
        justifyContent: 'flex-end',
    },

    botMessageWrapper: {
        justifyContent: 'flex-start',
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 5,
    },

    messageBubble: {
        borderRadius: 15,
        padding: 10,
        maxWidth: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },

    userMessage: {
        backgroundColor: colors.userBubble,
        marginLeft: 50,
        alignSelf: 'flex-end',
    },

    botMessage: {
        backgroundColor: colors.botBubble,
        marginRight: 50,
        alignSelf: 'flex-start',
    },

    messageText: {
        color: colors.userText,
    },

    botMessageText: {
        color: colors.botText,
    },

    typingIndicator: {
        marginLeft: 60,
        marginBottom: 10,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        // Adjust the margin or height to position it above bottom tabs
        marginBottom: Platform.OS === 'ios' ? 0 : 0,
        backgroundColor: '#fff',
    },

    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 15,
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        marginHorizontal: 10,
    },
});

export default Chatbot;
