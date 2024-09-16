import {styles} from "../App";
import {Image, Text, View, TouchableOpacity} from "react-native";
import {LinearGradient} from "expo-linear-gradient";

export function InfoCard({
                             color1,
                             color2,
                             source,
                             heading,
                             body,
                             headingStyle,
                             bodyStyle,
                             option,
                             navigation,
                         }) {
    if (source === "none") {
        return (
            <LinearGradient style={styles.info} colors={[color1, color2]}>
                <View style={styles.cardText2}>
                    <Text style={headingStyle}>{heading}</Text>
                    <Text style={bodyStyle}>{body}</Text>
                </View>
            </LinearGradient>
        );
    }
    if (option === 1) {
        return (
            <LinearGradient style={styles.info} colors={[color1, color2]}>
                <Image style={styles.img} source={source}/>
                <View style={styles.cardText}>
                    <Text style={headingStyle}>{heading}</Text>
                    <Text style={bodyStyle}>{body}</Text>
                </View>
            </LinearGradient>
        );
    } else
        return (
            <LinearGradient style={styles.info} colors={[color1, color2]}>
                <View style={styles.cardText}>
                    <Text style={headingStyle}>{heading}</Text>
                    <Text style={bodyStyle}>{body}</Text>
                </View>
                <Image style={styles.img} source={source}/>
            </LinearGradient>
        );
}
