import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { ButtonComponent } from '../components/ButtonComponent';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { IP_ADDRESS } from '@env';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold, Poppins500Medium} from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

const QUESTIONS = [
    "How often did you feel tired out for no good reason?",
    "How often did you feel nervous?",
    "How often did you feel so nervous that nothing could calm you down?",
    "How often did you feel hopeless?",
    "How often did you feel restless or fidgety?",
    "How often did you feel so restless you could not sit still?",
    "How often did you feel depressed?",
    "How often did you feel that everything was an effort?",
    "How often did you feel so sad that nothing could cheer you up?",
    "How often did you feel worthless?"
];

const OPTIONS = [
    { label: "Always", value: 5 },
    { label: "", value: 4 },
    { label: "", value: 3 },
    { label: "", value: 2 },
    { label: "Never", value: 1 }
];

const NUM_QUESTIONS_PER_PAGE = 5;

export function KesslerAssessmentScreen({ navigation }) {
    const [responses, setResponses] = useState(QUESTIONS.map(() => null));
    const [currentPage, setCurrentPage] = useState(0); // 0 for first page (questions 0-4), 1 for second page (questions 5-9)
    const [token, setToken] = useState(null);
    const [completed, setCompleted] = useState(false);

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

    const handleNextPage = () => {
        // If on first page, go to second page
        // If on second page, submit
        if (currentPage === 0) {
            // Check if first 5 questions answered
            const firstPageAnswered = responses.slice(0,5).every(r => r !== null);
            if (!firstPageAnswered) {
                Alert.alert('Error', 'Please answer all questions on this page before continuing.');
                return;
            }
            setCurrentPage(1);
        } else {
            // Submitting the assessment
            const allAnswered = responses.every(r => r !== null);
            if (!allAnswered) {
                Alert.alert('Error', 'Please answer all questions before submitting.');
                return;
            }
            submitAssessment();
        }
    };

    const submitAssessment = async () => {
        const totalScore = responses.reduce((sum, val) => sum + val, 0);

        try {
            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                navigation.navigate('Login');
                return;
            }

            const data = {
                assessmentType: "Kessler-10",
                responses: responses,
                score: totalScore
            };

            await axios.post(
                `${IP_ADDRESS}/assessments`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCompleted(true);
        } catch (error) {
            console.error('Error saving assessment:', error);
            Alert.alert("Error", "Failed to save assessment. Please try again.");
        }
    };

    if (completed) {
        // Congratulations Screen
        return (
            <View style={styles.congratsContainer}>
                <Text style={styles.congratsTitle}>Congratulations!</Text>
                <Image source={require('../../assets/super_hero.png')} style={styles.congratsImage} resizeMode="contain" />
                <Text style={styles.congratsText}>
                    You've successfully completed the K10 Emotional Well-being Assessment. Your insights are valuable in understanding your current emotional state.
                </Text>
                <Text style={styles.instructionText}>Please click the button below to continue to the main screen.</Text>
                <ButtonComponent
                    title="Home"
                    onPress={() => navigation.navigate("Home")}
                />
            </View>
        );
    }

    const startIndex = currentPage * NUM_QUESTIONS_PER_PAGE;
    const endIndex = startIndex + NUM_QUESTIONS_PER_PAGE;
    const pageQuestions = QUESTIONS.slice(startIndex, endIndex);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>What's on your mind?</Text>
            {currentPage === 0 && <Text style={styles.subheading}>In the past 4 weeks</Text>}

            {currentPage === 1 && <Text style={styles.subheading}>In the past 4 weeks</Text>}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {pageQuestions.map((q, index) => {
                    const qIndex = startIndex + index;
                    return (
                        <View key={qIndex} style={styles.questionContainer}>
                            <Text style={styles.questionText}>{q}</Text>
                            <View style={styles.radioRow}>
                                {OPTIONS.map((opt, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.radioCircle, responses[qIndex] === opt.value && styles.radioSelected]}
                                        onPress={() => handleValueChange(qIndex, opt.value)}
                                    >
                                        {opt.label !== "" && (
                                            <Text style={[styles.radioLabel, responses[qIndex] === opt.value && styles.radioLabelSelected]}>
                                                {opt.label}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNextPage}>
                    <Text style={styles.nextButtonText}>➜</Text>
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>{currentPage + 1}/2</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 28,
        // fontWeight: 'bold',
        color: '#0D1F3C',
        marginBottom: 10,
        textAlign: 'center'
    },
    subheading: {
        fontFamily: 'Poppins_600SemiBold',
        backgroundColor: '#C5C9E6',
        // alignSelf: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        color: '#0D1F3C',
        marginBottom: 20,
        // fontWeight: 'bold'

    },
    scrollContent: {
        paddingBottom: 100
    },
    questionContainer: {
        marginBottom: 30
    },
    questionText: {
        fontFamily: 'Poppins500Medium',
        fontSize: 16,
        color: '#0D1F3C',
        marginBottom: 10,
        // fontWeight: '600'
        textAlign: 'center'
    },
    radioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    radioCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioSelected: {
        borderColor: '#0D1F3C',
        backgroundColor: '#0D1F3C'
    },
    radioLabel: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#aaa'
    },
    radioLabelSelected: {
        fontFamily: 'Poppins_400Regular',
        color: '#fff',
        // fontWeight: 'bold'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center'
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#164D82',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    nextButtonText: {
        fontFamily: 'Poppins_400Regular',
        color: '#fff',
        fontSize: 24
    },
    pageIndicator: {
        fontSize: 14,
        color: '#333'
    },
    congratsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    congratsTitle: {
        fontSize: 28,
        fontFamily: 'Poppins_700Bold',
        // fontWeight: 'bold',
        color: '#0D1F3C',
        marginBottom: 20
    },
    congratsImage: {
        width: 400,
        height: 400,
        marginBottom: 20
    },
    congratsText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#0D1F3C',
        textAlign: 'center',
        marginBottom: 20
    },
    instructionText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20
    }
});
