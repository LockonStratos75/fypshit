import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {LoginScreen} from "../screens/LoginScreen";
import {SignUpScreen} from "../screens/SignUpScreen";
import {MyTabs} from "../navigation/BottomNavigator";  // Import the bottom tab navigator
import ChatSessionScreen from "../screens/ChatSessionScreen";
import Dashboard from "../screens/Dashboard"
import ChatScreen from "../screens/ChatScreen"
import ChatSessionsScreen from "../screens/ChatSessions"
import { Chat } from "../screens/Chat";  // Import Chat component here
import { SpeechEmotionScreen } from "../screens/SpeechEmotionScreen";
import SanityLevelScreen from "../screens/SanityLevelScreen";
import EmotionMenuScreen from "../screens/EmotionMenuScreen";
import {ImageEmotionScreen} from "../screens/ImageEmotionScreen";
import {ProfileScreen} from "../screens/ProfileScreen"

import { useFonts, Poppins_700Bold} from '@expo-google-fonts/poppins';
// import AppLoading from 'expo-app-loading';



const Stack = createNativeStackNavigator();

export const MyTheme = {
    dark: false,
    colors: {
        card: '#fff',
        // text: '#fff',
        notification: 'rgb(255, 69, 58)',
        primary: '#164D82',
        border: '#0E133C',
        background: '#fff',
    },
};

export function AppNavigator() {
    let [fontsLoaded] = useFonts({
        Poppins_700Bold, // Load the Poppins bold font
    });

    // if (!fontsLoaded) {
    //     return <AppLoading />;
    // }
    return (
        <NavigationContainer theme={MyTheme}>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerTitleAlign: 'center', // Center the header title
                    headerTitleStyle: {
                        fontFamily: 'Poppins_700Bold', // Use Poppins bold font
                        fontSize: 26,
                    },
                }}>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
                <Stack.Screen name="Sign Up" component={SignUpScreen} options={{headerShown: false}}/>
                {/*<Stack.Screen name="Sign Up T" component={SignUpTherapist} options={{ headerShown: false }} />*/}

                <Stack.Screen name="Home" component={Dashboard} options={{title: 'Dashboard'}}/>
                {/*<Stack.Screen name="Home" component={MyTabs} options={{title: 'Dashboard', headerShown: false}}/>*/}
                <Stack.Screen name="EditProfile" component={ProfileScreen} options={{title: 'Complete Profile'}}/>
                <Stack.Screen name="Chat" component={ChatScreen} options={{title: 'Chat'}}/>
                <Stack.Screen
                    name="Emotion Recognition"
                    component={SpeechEmotionScreen}
                />
                <Stack.Screen
                    name="ChatScreen"
                    component={Chat}
                    options={{
                        title: 'Eunoia',
                    }}
                />

                <Stack.Screen name="Sessions" component={ChatSessionsScreen}/>
                <Stack.Screen name="ChatSession" component={ChatSessionScreen}/>

                <Stack.Screen
                    name="Profile"
                    component={SanityLevelScreen}
                />
                <Stack.Screen name="fer" component={ImageEmotionScreen}  options={{
                    title: 'Face Emotion',
                }}/>


                <Stack.Screen name="Emotion" component={EmotionMenuScreen}/>

            </Stack.Navigator>
        </NavigationContainer>
    );
}
