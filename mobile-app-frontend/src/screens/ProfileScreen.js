import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert
} from 'react-native';
import { ButtonComponent } from '../components/ButtonComponent';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../App';
import { IP_ADDRESS } from '@env';

export function ProfileScreen({ navigation }) {
    const [gender, setGender] = useState('Prefer not to say');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [guardianPhoneNumber, setGuardianPhoneNumber] = useState('');

    useEffect(() => {
        (async () => {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                navigation.navigate('Login');
                return;
            }
        })();
    }, []);

    const isValidPhoneNumber = (number) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return !number || phoneRegex.test(number);
    };

    const handleSaveProfile = async () => {
        if (age && isNaN(age)) {
            Alert.alert('Error', 'Age must be a number.');
            return;
        }

        if (guardianPhoneNumber && !isValidPhoneNumber(guardianPhoneNumber)) {
            Alert.alert('Error', 'Please enter a valid guardian phone number in E.164 format.');
            return;
        }

        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            Alert.alert('Error', 'Please enter a valid phone number in E.164 format.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                navigation.navigate('Login');
                return;
            }

            const data = {
                gender,
                age: age ? parseInt(age, 10) : undefined,
                location,
                phoneNumber,
                guardianPhoneNumber,
                profileCompleted: true  // Explicitly send profileCompleted as true
            };

            const response = await axios.post(
                `${IP_ADDRESS}/profiles/complete`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('Profile completion response:', response.data);
            Alert.alert('Profile', 'Profile completed successfully!');
            navigation.navigate("Home");
        } catch (error) {
            console.error('Error completing profile:', error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Profile update failed. Please try again."
            );
        }
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Complete Your Profile</Text>
            <Text style={styles.h2}>Provide additional details to access the whole application</Text>

            <View style={styles.inputForm}>
                <Text style={styles.label}>Gender (Male, Female, Other, Prefer not to say)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Gender"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    value={gender}
                    onChangeText={value => setGender(value)}
                />

                <Text style={styles.label}>Age</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Age"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={value => setAge(value)}
                />

                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Location"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    value={location}
                    onChangeText={value => setLocation(value)}
                />

                <Text style={styles.label}>Phone Number (optional)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Phone Number"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    value={phoneNumber}
                    onChangeText={value => setPhoneNumber(value)}
                />

                <Text style={styles.label}>Guardian Phone Number (optional)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Guardian Phone Number"
                    placeholderTextColor={"rgba(33,37,41,0.12)"}
                    value={guardianPhoneNumber}
                    onChangeText={value => setGuardianPhoneNumber(value)}
                />

                <ButtonComponent
                    title="Save Profile"
                    onPress={handleSaveProfile}
                />
            </View>
        </View>
    );
}
