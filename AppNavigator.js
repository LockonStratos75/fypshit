import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {LoginScreen} from "./screens/LoginScreen";
import {SignUpScreen} from "./screens/SignUpScreen";
import {MyTabs} from "./BottomNavigator";
import useAuth from "./Hooks/useAuth";
import {SignUpTherapist} from "./screens/SignUpTherapist";
import ChatSessionScreen from "./screens/ChatSessionScreen";


const Stack = createNativeStackNavigator();

export const MyTheme = {
    dark: false,
    colors: {
        card: '#fff',
        text: '#fff',
        notification: 'rgb(255, 69, 58)',
        primary: '#164D82',
        border: '#0E133C',
        background: '#fff',
    },
};
export function AppNavigator () {
    const {user} = useAuth();
    if (user){
        return (
            <NavigationContainer theme={MyTheme} >
                <Stack.Navigator initialRouteName={"HomeTab"}>
                    <Stack.Screen name={"HomeTab"} component={MyTabs} options={{headerShown: false}}/>
                    <Stack.Screen name={"ChatSession"} component={ChatSessionScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
    else{
        return (
            <NavigationContainer theme={MyTheme} >
                <Stack.Navigator initialRouteName={"Login"}>
                    <Stack.Screen name={"Sign Up"} component={SignUpScreen} options={{headerShown: false}}/>
                    <Stack.Screen name={"Sign Up T"} component={SignUpTherapist} options={{headerShown: false}}/>
                    <Stack.Screen name={"Login"} component={LoginScreen} options={{headerShown: false}}/>
                </Stack.Navigator>
            </NavigationContainer>
        );

    }

}

