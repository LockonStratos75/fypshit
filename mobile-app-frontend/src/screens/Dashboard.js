// screens/Dashboard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function Dashboard({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Chat')} // Navigate to Chat screen
                >
                    <Image
                        source={require('../../assets/chat-button.png')} // Your exported button image
                        style={styles.buttonImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Emotion")}>
                    <Image
                        source={require('../../assets/check-emotion-button.png')} // Your exported button image
                        style={styles.buttonImage}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => console.log('Profile pressed')}>
                    <Image
                        source={require('../../assets/profile-button.png')} // Your exported button image
                        style={styles.buttonImage}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => console.log('Settings pressed')}>
                    <Image
                        source={require('../../assets/settings-button.png')} // Your exported button image
                        style={styles.buttonImage}
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
        fontWeight: 'bold',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        marginHorizontal: 10,
    },
    buttonImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});
