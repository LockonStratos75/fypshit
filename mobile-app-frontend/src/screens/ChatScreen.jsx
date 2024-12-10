// screens/ChatScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';


export default function ChatScreen({navigation}) {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen')}>
                    <Image
                        source={require('../../assets/chat-with-eunoia.png')} // Chat with Eunoia button image
                        style={styles.chatImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('Sessions')}>
                    <Image
                        source={require('../../assets/chat-sessions.png')} // Chat Sessions button image
                        style={styles.chatImage}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        fontFamily: 'Poppins_600SemiBold', // Poppins font
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatButton: {
        marginBottom: 20,
    },
    chatImage: {
        width: 300,
        height: 150,
        resizeMode: 'contain',
    },
});
