import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {styles} from "../App";
import Chatbot from "../components/Chatbot";


export function Chat() {
    return (
        <SafeAreaView>
            <Chatbot/>
        </SafeAreaView>
    )
}
