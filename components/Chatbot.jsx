import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform} from 'react-native';
import {styles} from "../App";
import TypingIndicator from '../components/TypingIndicator';
import {LinearGradient} from "expo-linear-gradient";
import {FileArrowUp, PaperPlaneRight, TrashSimple} from "phosphor-react-native";
import Sentiment from "sentiment";
import axios from 'axios';
import {useRoute} from '@react-navigation/native';
import * as Speech from 'expo-speech';
import * as SecureStore from 'expo-secure-store';  // Import SecureStore from Expo
import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from '@google/generative-ai';

const IP_ADDRESS = 'http://192.168.1.101:5000';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = 'AIzaSyDBj5nEBMQf9h0RBj0kL1rPRZCrfD1G728';  // Replace with your actual API key
const sysInstruct = `Eunoia, act as a mental health expert and therapist specializing in helping individuals in their 20s and 30s overcome challenges related to motivation, career, and self-esteem. Utilize your extensive experience of several decades to provide the best possible advice for improving mental health. Before offering specific advice, ask clarifying questions to understand the user's unique situation and tailor your response accordingly.`;

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef();
    const [isBotTyping, setIsBotTyping] = useState(false);
    const route = useRoute();
    const {onNewSession} = route.params || {};
    const [recordButton, setRecordButton] = useState(require('../icons/microphone-fill.png'));
    const sentiment = new Sentiment();
    const [sentimentScore, setSentimentScore] = useState('');
    const [results, setResults] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const webViewRef = useRef(null);
    const [chat, setChat] = useState(null);

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

    const speakText = (text) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 1.0,
        });
    };

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
            const token = await SecureStore.getItemAsync('token');  // Retrieve JWT token from SecureStore

            // Save the chat session to the server
            const response = await axios.post(`${IP_ADDRESS}/sessions`, sessionData, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Include token in Authorization header
                }
            });

            alert("Chat session saved successfully!");
            if (onNewSession) {
                onNewSession(response.data);
            }

            // New variable to calculate average sentiment score
            const userMessages = messages.filter(message => message.sender === 'You');  // Filter user messages only
            const sentimentScores = userMessages.map(message => sentiment.analyze(message.text).score);  // Calculate sentiment scores
            const averageSentimentScore = sentimentScores.length > 0
                ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length  // Calculate average sentiment
                : 0;  // Default to 0 if no user messages

            // Save the sentiment score to the server
            const sentimentResponse = await axios.post(`${IP_ADDRESS}/sentiment`, {
                sessionId: response.data._id,  // Use the saved session ID from response
                sessionName: `Chat Session ${sessionId}`,
                averageSentiment: averageSentimentScore,  // Average sentiment score calculated above
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`  // Include token in Authorization header
                }
            });

            // alert("Sentiment score saved successfully!");
        } catch (error) {
            console.error("Error saving chat session", error.response ? error.response.data : error.message);
            alert("Error saving chat session.");
        }
    };


    const clearChatHistory = () => {
        setMessages([]);
        setInput('');
    };

    const handleSend = useCallback(async () => {
        if (input.trim()) {
            const newMessages = [...messages, {text: input, sender: 'You'}];
            setMessages(newMessages);
            setIsBotTyping(true);

            try {
                const result = await chat.sendMessage(input.trim());
                setIsBotTyping(false);
                const botMessageText = extractText(result.response.text());
                newMessages.push({text: botMessageText, sender: 'Bot'});
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
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({animated: true})}
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
                        <TypingIndicator/>
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
                        style={{width: 150, marginRight: 20,}}
                    />
                    <TouchableOpacity onPress={() => saveChatSession()}>
                        <FileArrowUp size={25} color="#212529" weight="fill"/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => clearChatHistory()}>
                        <TrashSimple size={25} color="red" weight="fill"/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => RecordButtonHandler()}>
                        <Image source={recordButton} style={styles.iconImg}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => handleSend()}>
                    <LinearGradient
                        colors={['#247C8A', '#164D82']}
                        style={styles.circleButton}
                    >
                        <PaperPlaneRight size={24} color="#ffffff" weight="fill"/>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Chatbot;
