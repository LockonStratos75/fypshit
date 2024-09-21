import {LinearGradient} from "expo-linear-gradient";
import {Text, TouchableOpacity} from "react-native";
import {styles} from "../App";

export function ButtonComponent({title, onPress}) {
    return (
        <TouchableOpacity style={styles.fullWidth} onPress={onPress}>
            <LinearGradient
                colors={['#247C8A', '#164D82']}
                style={styles.buttOuter}
            >
                <Text style={styles.buttTitle}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}
