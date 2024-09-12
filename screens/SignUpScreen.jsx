import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { ButtonComponent } from "../components/ButtonComponent";
import axios from 'axios';  // Import axios for API requests
import * as SecureStore from 'expo-secure-store';  // Import SecureStore from Expo
import { styles } from '../App';

export function SignUpScreen({ navigation }) {
    const [username, setUsername] = useState("");  // New state for username
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (username && email && password) {  // Include username validation
            if (!isValidEmail(email)) {
                Alert.alert("Error", "Please enter a valid email address.");
                return;
            }

            try {
                const response = await axios.post('http://192.168.1.101:5000/signup', { username, email, password });  // Include username in request
                console.log('Server response:', response.data);  // Log the server response
                const { token } = response.data;  // Extract JWT token from response

                // Store token securely with SecureStore
                if (token && typeof token === 'string') {  // Ensure token is a valid string
                    await SecureStore.setItemAsync('token', token);  // Store the token directly as it is already a string
                } else {
                    console.error('Invalid token format:', token);  // Log the invalid token
                    throw new Error('Invalid token format received from server.');
                }

                Alert.alert("Signup", "Signup Successful!");
                navigation.navigate("Chat");  // Navigate to the next screen
            } catch (error) {
                console.error('Error during signup:', error);  // Log the error for debugging
                Alert.alert("Error", error.response?.data?.message || "Signup failed. Please try again.");  // Show a relevant error message
            }
        } else {
            Alert.alert("Error", "Please enter a username, valid email, and password.");
        }
    };




    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Sign Up</Text>
            <Text style={styles.h2}>Create an account</Text>
            <View style={styles.inputForm}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Username"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    value={username}
                    onChangeText={value => setUsername(value)}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    textContentType={"emailAddress"}
                    value={email}
                    onChangeText={value => setEmail(value)}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={value => setPassword(value)}
                    textContentType={"password"}
                />

                <ButtonComponent
                    title={"Sign Up"}
                    onPress={handleSubmit}
                />

                <TouchableOpacity onPress={() => navigation.navigate("Sign Up T")}>
                    <Text style={styles.caption}>
                        Want to create an account as a <Text style={[styles.mainCap, styles.mainCap]}>Therapist?</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
