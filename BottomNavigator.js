import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {ChatCenteredText, Chats, DotsThreeOutlineVertical, Record, User} from 'phosphor-react-native';
import { Chat } from "./screens/Chat";  // Import Chat component here
import ChatSessions from "./screens/ChatSessions";
import { SpeechEmotionScreen } from "./screens/SpeechEmotionScreen";
import EmotionLevelScreen from "./screens/EmotionLevelScreen";

const Tab = createBottomTabNavigator();

export function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerTintColor: 'black',
                headerRight: () => (
                    <DotsThreeOutlineVertical size={20} weight="fill" />
                ),
                headerRightContainerStyle: {
                    marginRight: 28,
                },
                headerTitleStyle: {
                    fontWeight: '900',
                    fontSize: 25,
                },
                tabBarShowLabel: false,
                tabBarInactiveTintColor: "#212529",
                tabBarStyle: {
                    height: 60,
                    paddingHorizontal: 5,
                    paddingTop: 0,
                    backgroundColor: "#F7F8FA",
                    position: "absolute",
                    borderTopWidth: 0,
                },
            })}
            initialRouteName="Chat"  // Ensure Chat is the initial route
        >
            <Tab.Screen
                name="Chat"
                component={Chat}
                options={{
                    title: 'Eunoia',
                    tabBarIcon: ({ color, size }) => (<ChatCenteredText color={color} size={size} weight={'fill'} />),
                }}
            />
            <Tab.Screen
                name="Sessions"
                component={ChatSessions}
                options={{
                    tabBarIcon: ({ color, size }) => (<Chats color={color} size={size} weight={'fill'} />),
                }}
            />
            <Tab.Screen
                name="Emotion Recognition"
                component={SpeechEmotionScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (<Record color={color} size={size} weight={'fill'} />),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={EmotionLevelScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (<User color={color} size={size} weight={'fill'} />),
                }}
            />
        </Tab.Navigator>
    );
}
