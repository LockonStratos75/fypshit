import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

// Define the base URL as a constant
const BASE_URL = 'http://192.168.100.90:5000'; // Replace with your IP address or localhost based on your setup

const ChatSessionScreen = ({ route }) => {
    const { sessionId } = route.params;
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/sessions/${sessionId}`); // Use the base URL variable
                setSession(response.data);
            } catch (error) {
                console.error("Error fetching chat session", error);
            }
        };

        fetchSession();
    }, [sessionId]);

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
