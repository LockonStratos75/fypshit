import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as FaceDetector from 'expo-face-detector';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { HUGGING_FACE_API_KEY } from '@env'; // Ensure your API key is stored securely
import {ButtonComponent} from '../components/ButtonComponent'

export const ImageEmotionScreen = () => {
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [loading, setLoading] = useState(false);

    // Request permissions
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Camera permissions are required to use this feature.'
                );
            }
        })();
    }, []);

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setImage(uri);
                await analyzeImage(uri);
            } else {
                Alert.alert('No image selected');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'An error occurred while taking a photo.');
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setImage(uri);
                await analyzeImage(uri);
            } else {
                Alert.alert('No image selected');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'An error occurred while picking an image.');
        }
    };

    const analyzeImage = async (uri) => {
        if (!uri) {
            Alert.alert('Invalid image', 'The image URI is invalid.');
            return;
        }

        setLoading(true);
        try {
            // Perform face detection
            const faceDetectionResult = await FaceDetector.detectFacesAsync(uri, {
                mode: FaceDetector.FaceDetectorMode.fast,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications: FaceDetector.FaceDetectorClassifications.none,
            });

            if (faceDetectionResult.faces && faceDetectionResult.faces.length > 0) {
                console.log('Faces detected:', faceDetectionResult.faces.length);

                // Read the image file as a Base64-encoded string
                const fileData = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Prepare the data payload
                const payload = {
                    inputs: fileData,
                };

                // Proceed with emotion recognition
                const emotionResponse = await axios.post(
                    'https://api-inference.huggingface.co/models/trpakov/vit-face-expression',
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (emotionResponse.data && emotionResponse.data.length > 0) {
                    const highestPrediction = emotionResponse.data[0];
                    console.log('Emotion Prediction:', highestPrediction);
                    if (highestPrediction.score >= 0.5) {
                        setEmotion(highestPrediction.label);
                    } else {
                        setEmotion('No emotion detected');
                    }
                } else {
                    setEmotion('No emotion detected');
                }
            } else {
                // No faces detected
                setEmotion('No face detected');
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            Alert.alert('Error', 'An error occurred while analyzing the image.');
            setEmotion('Error analyzing image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {!image ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={takePhoto}>
                        <Image
                            source={require('../../assets/photo.png')} // Update with your actual image path
                            style={styles.chatImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatButton} onPress={pickImage}>
                        <Image
                            source={require('../../assets/choose.png')} // Update with your actual image path
                            style={styles.chatImage}
                        />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.resultContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <Text style={styles.emotionText}>
                            {emotion === 'No face detected' ||
                            emotion === 'No emotion detected' ||
                            emotion === 'Error analyzing image'
                                ? emotion
                                : `Detected Emotion: ${emotion}`}
                        </Text>
                    )}
                    <ButtonComponent title={"Try Again"} onPress={() => setImage(null)}/>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emotionText: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        fontFamily: 'Poppins_600SemiBold',
    },
    image: {
        width: 300,
        height: 400,
        marginVertical: 20,
        resizeMode: 'contain',
        borderRadius: 10,
    },
});
