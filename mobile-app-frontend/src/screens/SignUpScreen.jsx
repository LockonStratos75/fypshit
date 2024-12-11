import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    Alert,
} from "react-native";
import { ButtonComponent } from "../components/ButtonComponent";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../App';
import { IP_ADDRESS } from '@env';

export function SignUpScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (username && email && password && confirmPassword) {
            if (!isValidEmail(email)) {
                Alert.alert("Error", "Please enter a valid email address.");
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match.");
                return;
            }

            if (password.length < 6) {
                Alert.alert("Error", "Password must be at least 6 characters long.");
                return;
            }

            try {
                const response = await axios.post(
                    `${IP_ADDRESS}/auth/register`,
                    {
                        username,
                        email,
                        password
                    },
                    { withCredentials: true }
                );

                console.log('Server response:', response.data);
                const { token } = response.data;

                if (!token || typeof token !== 'string') {
                    console.error('Invalid response format. Token missing or not a string.');
                    throw new Error('Invalid response format received from server.');
                }

                // Store token only
                await SecureStore.setItemAsync('token', token);

                Alert.alert("Signup", "Signup Successful!");
                navigation.navigate("EditProfile");
            } catch (error) {
                console.error('Error during signup:', error);
                Alert.alert("Error", error.response?.data?.message || "Signup failed. Please try again.");
            }
        } else {
            Alert.alert("Error", "Please fill in all required fields (Username, Email, Password, Confirm Password).");
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
                <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={value => setConfirmPassword(value)}
                />

                <ButtonComponent
                    title={"Sign Up"}
                    onPress={handleSubmit}
                />
            </View>
        </View>
    );
}
