// Chatbot.js

import React, {useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle} from 'react';
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {styles} from '../App';
import TypingIndicator from '../components/TypingIndicator';
import {LinearGradient} from 'expo-linear-gradient';
import {FileArrowUp, PaperPlaneRight, TrashSimple} from 'phosphor-react-native';
import axios from 'axios';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from '@google/generative-ai';
import Voice from '@react-native-voice/voice';
import {decode} from 'he';
import {MarkdownView} from 'react-native-markdown-view';
import {getSpeech} from '../services/textToSpeech'; // Import TTS functions
import {Audio} from 'expo-av'; // Import Audio

import {GOOGLE_API_KEY, HUGGING_FACE_API_KEY, IP_ADDRESS} from '@env';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = GOOGLE_API_KEY; // Replace with your actual API key

const sysInstruct = `As Eunoia, a compassionate and understanding mental health therapist with decades of experience, engage with users in their 20s and 30s seeking guidance on motivation, career, and self-esteem. Provide responses that are empathetic, concise, and emotionally supportive. Use a warm and friendly tone, and keep your messages short and relatable. Before giving specific advice, ask thoughtful questions to better understand the user's situation and tailor your guidance accordingly.`;

const API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';

const Chatbot = forwardRef((props, ref) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef();
    const [isBotTyping, setIsBotTyping] = useState(false);
    const route = useRoute();
    const {onNewSession} = route.params || {};
    const [recordButton, setRecordButton] = useState(require('../../assets/icons/microphone-fill.png'));
    const [results, setResults] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [chat, setChat] = useState(null);

    // TTS States
    const [selectedVoice, setSelectedVoice] = useState(null); // Changed to null and expect an object
    const [audioEncoding, setAudioEncoding] = useState('LINEAR16'); // Default encoding
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const [ttsLoading, setTtsLoading] = useState(false);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getMessages: () => messages,
        clearMessages: () => {
            setMessages([]);
            setInput('');
        },
    }));

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

    useFocusEffect(
        React.useCallback(() => {
            const loadTtsSettings = async () => {
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
                            // Stored as plain string (legacy format)
                            console.warn('Stored voice is in legacy format (plain string). Updating to new format.');
                            parsedVoice = null;
                            // Optionally, delete the old stored value
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
                            [{ text: 'OK' }]
                        );
                    }
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
        setResults(e.value);
        setInput(e.value[0]);
    };

    const onSpeechEnd = (e) => {
        console.log('onSpeechEnd: ', e);
        setIsRecording(false);
        setRecordButton(require('../../assets/icons/microphone-fill.png'));
    };

    const onSpeechError = (e) => {
        console.log('onSpeechError: ', e);
        setIsRecording(false);
        setRecordButton(require('../../assets/icons/microphone-fill.png'));
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
            setRecordButton(require('../../assets/icons/stop-fill.png'));
            startRecognizing();
        } else {
            setRecordButton(require('../../assets/icons/microphone-fill.png'));
            stopRecognizing();
        }
    };

    const parseMarkdown = (text) => {
        const decodedText = decode(text);

        return (
            <MarkdownView
                styles={{
                    paragraph: {marginTop: 0, marginBottom: 0},
                    strong: {fontWeight: 'bold'},
                    em: {fontStyle: 'italic'},
                    listItemBullet: {fontSize: 12},
                    listItemNumber: {fontSize: 12},
                    listItem: {
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        marginBottom: 4,
                    },
                    listItemContent: {flex: 1},
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

    const analyzeSentiment = async (text) => {
        try {
            const response = await axios.post(
                API_URL,
                {inputs: text},
                {headers: {Authorization: `Bearer ${HUGGING_FACE_API_KEY}`}}
            );

            const data = response.data;

            if (Array.isArray(data) && Array.isArray(data[0])) {
                const sentiments = data[0];

                const positive = sentiments.find(s => s.label.toLowerCase() === 'positive');
                const negative = sentiments.find(s => s.label.toLowerCase() === 'negative');

                if (positive && negative) {
                    const sentimentScore = positive.score - negative.score;
                    return sentimentScore;
                }
            }

            console.error("Unexpected response format:", data);
            return null;
        } catch (error) {
            console.error("Error analyzing sentiment", error);
            return null;
        }
    };

    const saveChatSession = async () => {
        const sessionId = `session-${Date.now()}`;
        const sessionData = {
            id: sessionId,
            date: new Date().toLocaleDateString(),
            messages: messages.map(message => ({
                text: typeof message.text === 'string' ? message.text : extractText(message.text),
                sender: message.sender,
            })),
        };

        try {
            const token = await SecureStore.getItemAsync('token');

            const response = await axios.post(
                `${IP_ADDRESS}/sessions`,
                sessionData,
                {headers: {'Authorization': `Bearer ${token}`}}
            );

            Alert.alert("Success", "Chat session saved successfully!");
            if (onNewSession) {
                onNewSession(response.data);
            }

            const userMessages = messages.filter(msg => msg.sender === 'You');
            const sentimentScores = await Promise.all(userMessages.map(msg => analyzeSentiment(msg.text)));
            const validScores = sentimentScores.filter(score => score !== null);
            const averageSentimentScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

            await saveSentimentScore(response.data._id, sessionData.id, averageSentimentScore, token);

        } catch (error) {
            console.error("Error saving chat session", error.response ? error.response.data : error.message);
            Alert.alert("Error", "Error saving chat session.");
        }
    };

    const saveSentimentScore = async (sessionId, sessionName, averageSentiment, token) => {
        try {
            const response = await axios.post(
                `${IP_ADDRESS}/sentiment`,
                {sessionId, sessionName, averageSentiment},
                {headers: {'Authorization': `Bearer ${token}`}}
            );
            console.log("Sentiment score saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving sentiment score", error);
        }
    };

    const clearChatHistory = () => {
        setMessages([]);
        setInput('');
    };

    const playBotResponse = async (text) => {
        if (!text.trim() || !isTtsEnabled) {
            return;
        }

        if (!selectedVoice) {
            Alert.alert(
                'No Voice Selected',
                'Please select a voice for Text-to-Speech in your settings.',
                [{ text: 'OK' }]
            );
            return;
        }

        setTtsLoading(true);
        try {

            const audioContent = await getSpeech(text, selectedVoice, audioEncoding);

            // Adjust the MIME type mapping
            let mimeType;
            if (audioEncoding === 'MP3') {
                mimeType = 'audio/mpeg';
            } else if (audioEncoding === 'LINEAR16') {
                mimeType = 'audio/wav';
            } else if (audioEncoding === 'MULAW') {
                mimeType = 'audio/basic';
            } else {
                mimeType = 'audio/mpeg'; // Default to MP3 MIME type
            }

            const base64Audio = `data:${mimeType};base64,${audioContent}`;

            const { sound } = await Audio.Sound.createAsync(
                { uri: base64Audio },
                { shouldPlay: true }
            );

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    sound.unloadAsync();
                }
            });

            // Optionally, log the status for debugging
            const status = await sound.getStatusAsync();
            console.log('Sound Status:', status);
        } catch (error) {
            console.error('Error during audio playback:', error);
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

                // Store plain text
                newMessages.push({ text: botMessageText, sender: 'Bot' });
                setMessages([...newMessages]);
                setInput('');

                // Call playBotResponse with the bot's message text
                playBotResponse(botMessageText);
            } catch (error) {
                console.error('Error with Gemini API response:', error);
                setIsBotTyping(false);
            }
        }
    }, [input, messages, chat, selectedVoice, audioEncoding, isTtsEnabled]);

    return (
        <View style={[styles.botContainer]}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.messageContainer}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({animated: true})}
            >
                {messages.map((msg, index) => (
                    <View key={index} style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}>
                        {msg.sender === 'You' ? (
                            <Text style={styles.messageText}>
                                {msg.text}
                            </Text>
                        ) : (
                            parseMarkdown(msg.text)
                        )}
                    </View>
                ))}

                {isBotTyping && (
                    <View style={styles.botMessage}>
                        <TypingIndicator/>
                    </View>
                )}
                {ttsLoading && (
                    <View style={{marginTop: 10, alignItems: 'center'}}>
                        <Text>Playing audio...</Text>
                        <ActivityIndicator size="small" color="#0000ff"/>
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
                        style={{width: 150, marginRight: 20, fontFamily: 'Poppins400Regular'}}
                    />
                    {/*<TouchableOpacity onPress={saveChatSession}>*/}
                    {/*    <FileArrowUp size={25} color="#212529" weight="fill"/>*/}
                    {/*</TouchableOpacity>*/}

                    {/*<TouchableOpacity onPress={clearChatHistory}>*/}
                    {/*    <TrashSimple size={25} color="red" weight="fill"/>*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity onPress={RecordButtonHandler}>
                        <Image source={recordButton} style={styles.iconImg}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSend}>
                    <LinearGradient colors={['#247C8A', '#164D82']} style={styles.circleButton}>
                        <PaperPlaneRight size={24} color="#ffffff" weight="fill"/>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default Chatbot;
