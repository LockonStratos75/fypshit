import {Text, View, Image, ScrollView, TouchableOpacity} from "react-native";
import {styles, image1, image2} from "../App";
import {LinearGradient} from "expo-linear-gradient";
import {InfoCard} from "../components/InfoCard";


export function Home({navigation}) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.h1}>Welcome John Doe</Text>
            <ScrollView
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <TouchableOpacity onPress={() => navigation.navigate("Info")}>
                        <InfoCard
                            color1={"#247C8A"}
                            color2={"transparent"}
                            source={image1}
                            heading={"Information"}
                            body={
                                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                            }
                            headingStyle={styles.h2}
                            bodyStyle={styles.bodyText}
                        />
                    </TouchableOpacity>

                    <InfoCard
                        color1={"#F3AE8B"}
                        color2={"#ED8BC9"}
                        source={image2}
                        heading={"Information"}
                        body={
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                        }
                        headingStyle={styles.h2Color}
                        bodyStyle={styles.bodyText2}
                    />

                    <InfoCard
                        color1={"#247C8A"}
                        color2={"transparent"}
                        source={image1}
                        heading={"Information"}
                        body={
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                        }
                        headingStyle={styles.h2}
                        bodyStyle={styles.bodyText}
                    />

                    <InfoCard
                        color1={"#F3AE8B"}
                        color2={"#ED8BC9"}
                        source={image2}
                        heading={"Information"}
                        body={
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                        }
                        headingStyle={styles.h2Color}
                        bodyStyle={styles.bodyText2}
                    />

                    <InfoCard
                        color1={"#247C8A"}
                        color2={"transparent"}
                        source={image1}
                        heading={"Information"}
                        body={
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                        }
                        headingStyle={styles.h2}
                        bodyStyle={styles.bodyText}
                    />

                    <InfoCard
                        color1={"#F3AE8B"}
                        color2={"#ED8BC9"}
                        source={image2}
                        heading={"Information"}
                        body={
                            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia"
                        }
                        headingStyle={styles.h2Color}
                        bodyStyle={styles.bodyText2}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
