import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { styles } from "../App";
import TypingIndicator from '../components/TypingIndicator'; // Ensure this import points to the correct file
import { LinearGradient } from "expo-linear-gradient";
import { FileArrowUp, PaperPlaneRight, TrashSimple } from "phosphor-react-native";
import Sentiment from "sentiment";
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech'; // Import Expo Speech for text-to-speech
// import { WebView } from 'react-native-webview'; // WebView for speech-to-text
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const IP_ADDRESS = 'http://192.168.100.10:5000'; // Replace with your IP address or localhost

const MODEL_NAME = 'gemini-1.5-pro-latest';
const API_KEY = 'AIzaSyBEpDxix0X-uiO-faUUOxQ2943m6_Mkfgk';  // Replace with your actual API key
const sysInstruct = `Eunoia, act as a mental health expert and therapist specializing in helping individuals in their 20s and 30s overcome challenges related to motivation, career, and self-esteem. Utilize your extensive experience of several decades to provide the best possible advice for improving mental health. Before offering specific advice, ask clarifying questions to understand the user's unique situation and tailor your response accordingly.`;

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef();
    const [isBotTyping, setIsBotTyping] = useState(false);
    const route = useRoute();
    const { onNewSession } = route.params || {};
    const [recordButton, setRecordButton] = useState(require('../icons/microphone-fill.png'));
    const sentiment = new Sentiment();
    const [sentimentScore, setSentimentScore] = useState('');
    const [results, setResults] = useState([]);
    const [isRecording, setIsRecording] = useState(false);

    // WebView Ref for Speech-to-Text
    const webViewRef = useRef(null);

    const [chat, setChat] = useState(null); // State for Gemini API chat session

    useEffect(() => {
        if (Platform.OS === 'web') {
            alert("Speech recognition is not supported on web yet.");
        }

        // Initialize Google Generative AI Model
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: sysInstruct,
        });

        const generationConfig = {
            temperature: 1,
            topK: 0,
            topP: 0.95,
            maxOutputTokens: 8192,
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
    }, []);

    // Function to handle Text-to-Speech (if needed)
    const speakText = (text) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 1.0,
        });
    };

    // Function to handle Speech-to-Text using WebView
    const onMessageFromWebView = (event) => {
        const data = event.nativeEvent.data;
        if (data) {
            setInput(data);
            setResults([data]);
        }
    };

    const startRecognizing = () => {
        setIsRecording(true);
        webViewRef.current.injectJavaScript(`
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                window.ReactNativeWebView.postMessage(transcript);
            };
            recognition.start();
        `);
    };

    const stopRecognizing = () => {
        setIsRecording(false);
        webViewRef.current.injectJavaScript(`
            recognition.stop();
        `);
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

    const parseMarkdown = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (/^\*\*(.*)\*\*$/.test(part)) {
                const boldText = part.match(/^\*\*(.*)\*\*$/)[1];
                return (
                    <Text key={index} style={[styles.botMessageText, styles.boldText]}>
                        {boldText}
                    </Text>
                );
            } else {
                return <Text key={index} style={styles.botMessageText}>{part}</Text>;
            }
        });

        return <Text style={styles.botMessageText}>{parts}</Text>;
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
            const response = await axios.post(`${IP_ADDRESS}/sessions`, sessionData); // Use IP_ADDRESS variable
            alert("Chat session saved successfully!");
            if (onNewSession) {
                onNewSession(response.data);
            }
        } catch (error) {
            console.error("Error saving chat session", error);
            alert("Error saving chat session.");
        }
    };

    const clearChatHistory = () => {
        setMessages([]);
        setInput('');
    };

    const handleSend = useCallback(async () => {
        if (input.trim()) {
            const newMessages = [...messages, { text: input, sender: 'You' }];
            setMessages(newMessages);
            setIsBotTyping(true);

            // Use the Gemini API to get a response from the chatbot
            try {
                const result = await chat.sendMessage(input.trim());
                setIsBotTyping(false);
                const botMessageText = extractText(result.response.text());
                newMessages.push({ text: botMessageText, sender: 'Bot' });
                setMessages([...newMessages]);
                setInput('');
            } catch (error) {
                console.error("Error with Gemini API response:", error);
                setIsBotTyping(false);
            }
        }
    }, [input, messages, chat]);

    return (
        <View style={[styles.botContainer]}>
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
            </ScrollView>
            <View style={[styles.wrapper2, styles.rowDirection]}>
                <View style={[styles.smallInput, styles.rowDirection]}>
                    <TextInput
                        onChangeText={setInput}
                        value={input}
                        placeholder="Type your message here..."
                        multiline={true}
                        style={{ width: 150, marginRight: 20, }}
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
