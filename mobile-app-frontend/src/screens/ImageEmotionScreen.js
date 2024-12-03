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
import axios from 'axios';
import { Buffer } from 'buffer';
import { useNavigation } from '@react-navigation/native';
import { ButtonComponent} from '../components/ButtonComponent'

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
            // Read the image file as a Base64-encoded string
            const fileData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Prepare the data payload
            const payload = {
                inputs: fileData,
            };

            const apiResponse = await axios.post(
                'https://api-inference.huggingface.co/models/trpakov/vit-face-expression',
                payload,
                {
                    headers: {
                        Authorization: 'Bearer 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',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (apiResponse.data && apiResponse.data.length > 0) {
                setEmotion(apiResponse.data[0].label);
            } else {
                setEmotion('No emotion detected');
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
                            source={require('../../assets/photo.png')}
                            style={styles.chatImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatButton} onPress={pickImage}>
                        <Image
                            source={require('../../assets/choose.png')}
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
                        <Text style={styles.emotionText}>Detected Emotion: {emotion}</Text>
                    )}
                    {/*<TouchableOpacity style={styles.chatButton} >*/}
                    {/*    <Image*/}
                    {/*        source={require('../../assets/fer.png')}*/}
                    {/*        style={styles.chatImage}*/}
                    {/*    />*/}
                    {/*</TouchableOpacity>*/}
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
        width: '50%'
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
