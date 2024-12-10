import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { ButtonComponent } from '../components/ButtonComponent';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { styles } from '../App';
import { IP_ADDRESS } from '@env';

// Example questions for Kessler-10 (simplified)
const QUESTIONS = [
    "In the past 4 weeks, how often did you feel tired for no good reason?",
    "In the past 4 weeks, how often did you feel nervous?",
    "In the past 4 weeks, how often did you feel so nervous that nothing could calm you down?",
    "In the past 4 weeks, how often did you feel hopeless?",
    "In the past 4 weeks, how often did you feel restless or fidgety?",
    "In the past 4 weeks, how often did you feel so restless you could not sit still?",
    "In the past 4 weeks, how often did you feel depressed?",
    "In the past 4 weeks, how often did you feel that everything was an effort?",
    "In the past 4 weeks, how often did you feel so sad that nothing could cheer you up?",
    "In the past 4 weeks, how often did you feel worthless?"
];

// Example response options - each maps to a numeric score
const OPTIONS = [
    { label: "None of the time", value: 1 },
    { label: "A little of the time", value: 2 },
    { label: "Some of the time", value: 3 },
    { label: "Most of the time", value: 4 },
    { label: "All of the time", value: 5 }
];

const RadioGroup = ({ selectedValue, onValueChange, options }) => {
    return (
        <View style={{ marginVertical: 10 }}>
            {options.map(opt => (
                <View key={opt.value} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                    <Text
                        onPress={() => onValueChange(opt.value)}
                        style={{
                            marginRight: 10,
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#333',
                            backgroundColor: selectedValue === opt.value ? '#333' : '#fff'
                        }}
                    />
                    <Text onPress={() => onValueChange(opt.value)} style={{ color: '#333' }}>{opt.label}</Text>
                </View>
            ))}
        </View>
    );
};

export function KesslerAssessmentScreen({ navigation }) {
    const [responses, setResponses] = useState(QUESTIONS.map(() => null));
    const [score, setScore] = useState(null); // store final score after submission
    const [report, setReport] = useState(null); // store generated report summary
    const [token, setToken] = useState(null);

    useEffect(() => {
        (async () => {
            const storedToken = await SecureStore.getItemAsync('token');
            if (!storedToken) {
                Alert.alert('Error', 'User not authenticated.');
                navigation.navigate('Login');
                return;
            }
            setToken(storedToken);
        })();
    }, []);

    const handleValueChange = (qIndex, value) => {
        const newResponses = [...responses];
        newResponses[qIndex] = value;
        setResponses(newResponses);
    };

    const handleSubmit = async () => {
        // Check if all questions answered
        if (responses.some(r => r === null)) {
            Alert.alert('Error', 'Please answer all questions before submitting.');
            return;
        }

        // Calculate score
        const totalScore = responses.reduce((sum, val) => sum + val, 0);
        setScore(totalScore);

        // Generate a basic report
        const summary = `Your total Kessler-10 score is ${totalScore}. ` +
            `A higher score suggests greater psychological distress. ` +
            `Please consider reaching out to a professional if your score is high.`;
        setReport(summary);

        // Save assessment to backend
        try {
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                navigation.navigate('Login');
                return;
            }

            const assessmentData = {
                assessmentType: "Kessler-10", // FE-1: specify assessment type
                responses: responses,
                score: totalScore
            };

            // Create the assessment record (FE-4: store scores, FE-6: integrate with user data)
            const response = await axios.post(
                `${IP_ADDRESS}/assessments`,
                assessmentData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Assessment saved:', response.data);
            Alert.alert("Assessment Completed", "Your responses have been recorded.");

            // Optionally, schedule next assessment (FE-2)
            // await axios.post(`${IP_ADDRESS}/assessments/schedule`, { interval: '30days' }, {
            //   headers: { Authorization: `Bearer ${token}` }
            // });

            // If needed, integrate with profile (FE-6) is done indirectly since `userId` is known in backend.
            // The user is stored in the assessment via userId from the token.

        } catch (error) {
            console.error('Error saving assessment:', error);
            Alert.alert("Error", "Failed to save assessment. Please try again.");
        }
    };

    return (
        <ScrollView style={styles.wrapper}>
            <Text style={styles.h1}>Kessler-10 Assessment</Text>
            <Text style={styles.h2}>Please answer the following questions based on the past 4 weeks.</Text>

            {QUESTIONS.map((q, index) => (
                <View key={index} style={{ marginVertical: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{q}</Text>
                    <RadioGroup
                        selectedValue={responses[index]}
                        onValueChange={(val) => handleValueChange(index, val)}
                        options={OPTIONS}
                    />
                </View>
            ))}

            <ButtonComponent title="Submit" onPress={handleSubmit} />

            {score !== null && (
                <View style={{ marginTop: 30 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Results:</Text>
                    <Text style={{ marginTop: 10 }}>{report}</Text>
                </View>
            )}
        </ScrollView>
    );
}
