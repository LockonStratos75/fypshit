import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

// Define the base URL as a constant
// const BASE_URL = 'http://192.168.100.90:5000'; // Replace with your IP address or localhost based on your setup
const BASE_URL = 'http://10.113.88.141:5000'; // Replace with your IP address or localhost based on your setup

const ChatSessionsScreen = () => {
    const navigation = useNavigation();
    const [sessions, setSessions] = useState([]);

    const fetchSessions = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/sessions`); // Use the base URL variable
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching chat sessions", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [fetchSessions])
    );

    const deleteSession = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/sessions/${id}`); // Use the base URL variable
            setSessions(prevSessions => prevSessions.filter(session => session._id !== id));
        } catch (error) {
            console.error("Error deleting chat session", error);
            Alert.alert('Error', 'Failed to delete session.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.sessionItem}>
            <TouchableOpacity
                style={styles.sessionContent}
                onPress={() => navigation.navigate('ChatSession', { sessionId: item._id })}
            >
                <Text style={styles.sessionTitle}>{`Chat Session ${item.id}`}</Text>
                <Text style={styles.sessionDate}>{item.date}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                    Alert.alert(
                        'Delete Session',
                        'Are you sure you want to delete this session?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteSession(item._id) },
                        ]
                    );
                }}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sessions}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
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
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        marginBottom: 8,
    },
    sessionContent: {
        flex: 1,
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sessionDate: {
        fontSize: 14,
        color: '#555',
    },
    deleteButton: {
        marginLeft: 16,
        padding: 8,
        backgroundColor: '#FF6347',
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ChatSessionsScreen;
