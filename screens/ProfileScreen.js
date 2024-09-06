import {View, Text} from "react-native";
import {styles} from "../App";
import {Avatar} from "react-native-paper";
import {InfoCard} from "../components/InfoCard";

export function ProfileScreen() {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Profile</Text>
            <View style={styles.wrapper2}>
                <View>
                    <Avatar.Image
                        size={100}
                        source={require("../assets/personal growth-bro (1).png")}
                    />
                </View>
                <Text style={styles.h2Normal}>Jane Doe</Text>
                <InfoCard
                    color1={"#485096"}
                    color2={"#485096"}
                    source={"none"}
                    heading={"Information"}
                    body={`Lorem ipsum dolor sit amet consectetur adipisicing elit.Maxime mollitiaLorem ipsum dolor sit amet 
consectetur adipisicing elit.

Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum
laborumnumquam blanditiis harum quisquam eius sed 
odit fugiat iusto fuga praesentiumoptio, eaque rerum!`}
                    headingStyle={styles.h2}
                    bodyStyle={styles.bodyText}
                />

                <Text style={styles.bodyText}></Text>
            </View>
        </View>
    );
}
