import {styles} from "../App";
import {Text, TextInput, View} from "react-native";

export function SentimentScore({setSentimentScore, sentimentScore, sentimentResult}) {
    return(
        <View style={styles.wrapper2}>
            <TextInput
                onChangeText={(text) => {
                    setSentimentScore(text)
                }}
                style={styles.textInput}
                value={sentimentScore}
                placeholder={"Enter a sentence to get its sentiment score"}
                placeholderTextColor={"white"}
            ></TextInput>
            <Text style={{textAlign: "center", color: "white"}}>Sentiment Score: {sentimentResult.score}</Text>
        </View>
    )
}
