import {SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {styles} from "../App";
import Chatbot from "../components/Chatbot";


export function Chat() {

    // const [recordButton, setRecordButton] = useState(require('../icons/microphone-fill.png'));
    //
    //
    // const sentiment = new Sentiment();
    // const [sentimentScore, setSentimentScore] = useState('');
    //
    // const sentimentResult = sentiment.analyze(sentimentScore);
    //
    // const [results, setResults] = useState([]);
    //
    // useEffect(() => {
    //     Voice.onSpeechStart = speechStartHandler;
    //     Voice.onSpeechEnd = speechEndHandler;
    //     Voice.onSpeechResults = speechResultsHandler;
    //
    //     return () => {
    //         Voice.destroy().then(Voice.removeAllListeners);
    //     }
    // }, []);
    //
    // const speechStartHandler = (e) => {
    //     console.log("Speech Start Accessed", e);
    //     setSentimentScore('');
    // };
    // const speechEndHandler = (e) => {
    //     console.log("Speech End Accessed", e);
    //     setRecordButton(require('../icons/microphone-fill.png'));
    //
    // };
    // const speechResultsHandler = (e) => {
    //     console.log("Speech Results: ", e);
    //     if (e.value && e.value.length > 0) {
    //         // Find the longest string in the array
    //         const bestResult = e.value.reduce((longest, current) => {
    //             return current.length > longest.length ? current : longest;
    //         }, "");
    //
    //         setResults(e.value);
    //         setSentimentScore(bestResult); // Set the longest result as the sentimentScore
    //     }
    // };
    //
    //
    // const startRecognizing = async () => {
    //     try {
    //         await Voice.start('en-US');
    //         setResults([]);
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    // const stopRecognizing = async () => {
    //     try {
    //         await Voice.stop();
    //         await Voice.destroy();
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    //
    // const RecordButtonHandler = async () => {
    //     if (recordButton === require('../icons/microphone-fill.png')) {
    //         setRecordButton(require('../icons/stop-fill.png'));
    //         await startRecognizing();
    //     } else {
    //         setRecordButton(require('../icons/microphone-fill.png'));
    //         await stopRecognizing();
    //     }
    // }

    return (
        <SafeAreaView>
            <Chatbot/>
        </SafeAreaView>
    )
}
