import React, {useState} from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity, Alert,
} from "react-native";

import {ButtonComponent} from "../components/ButtonComponent";
import {createUserWithEmailAndPassword} from "firebase/auth"
import {auth} from "../config/firebase"
import {styles} from '../App'

export function SignUpTherapist({navigation}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        if (email && password) {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            catch (error) {
                Alert.alert("Error", error.message)
            }
        }
    }


    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Signup as a Therapist</Text>
            <Text style={styles.h2}>Create an account</Text>
            <View style={styles.inputForm}>
                {/*<TextInput*/}
                {/*    style={styles.textInput}*/}
                {/*    placeholder="Name"*/}
                {/*    placeholderTextColor={"white"}*/}
                {/*/>*/}
                <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    textContentType={"emailAddress"}
                    value={email}
                    onChangeText={value => setEmail(value)}
                />
                {/*<TextInput*/}
                {/*    style={styles.textInput}*/}
                {/*    placeholder="Phone"*/}
                {/*    placeholderTextColor={"white"}*/}
                {/*    maxLength={11}*/}
                {/*    keyboardType={"number-pad"}*/}
                {/*/>*/}
                <TextInput
                    style={styles.textInput}
                    placeholder="Qualification"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
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
                    textContentType={"password"}
                />

                <ButtonComponent
                    title={"Sign Up"}
                    // onPress={() => navigation.navigate("Login")}
                    onPress={handleSubmit}
                />

            </View>
        </View>
    );
}

