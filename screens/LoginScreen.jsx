import React, {useState} from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar, Alert,
} from "react-native";
import {ButtonComponent} from "../components/ButtonComponent";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../config/firebase";
import {styles} from '../App'

export function LoginScreen({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        if (email && password) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                Alert.alert("Login", "Login Successful!");
            }
            catch (error) {
                Alert.alert("Error", error.message)
            }
        }
    }

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
                        Don't have an account? <Text style={[styles.mainCap,styles.mainCap]}>Create One</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

