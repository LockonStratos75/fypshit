import {SafeAreaView, Text, View} from "react-native";
import {styles} from "../App";
import {Searchbar} from "react-native-paper";
import {checkFireStore} from '../config/firestoreCheck'

// checkFireStore();


export function SearchScreen() {
    return (
        <SafeAreaView>
            <View style={styles.wrapper}>
                <Text style={styles.h1}>Search</Text>
                <Searchbar
                    placeholder={"Search"}
                    iconColor={"white"}
                    style={{
                        backgroundColor: "#485096",
                        marginTop: 16,
                        height: 50,
                        borderRadius: 24,
                    }}
                    placeholderTextColor={"white"}
                    inputStyle={{
                        color: "white",
                        paddingBottom: 5,
                    }}
                />

                <View>
                    <Text>{checkFireStore()}</Text>
                </View>

                <Text style={styles.h2}>Recent Searches</Text>
            </View>
        </SafeAreaView>
    );
}
