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
import {
    IP_ADDRESS,
} from '@env';

export function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        console.log(IP_ADDRESS)
        if (email && password) {
            try {
                const response = await axios.post(`${IP_ADDRESS}/auth/login`, { email, password });  // Corrected line
                const { token } = response.data;  // Extract JWT token from response

                if (token && typeof token === 'string') {  // Ensure token is a valid string
                    await SecureStore.setItemAsync('token', token);  // Store the token directly as it is already a string
                    console.log(token);
                } else {
                    console.error('Invalid token format');
                    throw new Error('Invalid token format received from server.');
                }

                Alert.alert("Login", "Login Successful!");
                navigation.navigate("Home");  // Navigate to the next screen
            } catch (error) {
                Alert.alert("Error", error.message);
            }
        }
    };



    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Login</Text>
            <Text style={styles.h2}>Login to your account</Text>
            <View style={styles.inputForm}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    textContentType={"emailAddress"}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
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
                    title={"Login"}
                    onPress={handleSubmit}
                />

                <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
                    <Text style={styles.caption}>
                        Don't have an account? <Text style={[styles.mainCap, styles.mainCap]}>Create One</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
