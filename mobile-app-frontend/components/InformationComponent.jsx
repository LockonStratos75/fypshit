import { styles } from "../App";
import { Text, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ButtonComponent } from "./ButtonComponent";

export function InformationComponent({
  image,
  gradientFrom,
  gradientTo,
  content,
  name,
  press,
}) {
  return (
    <ScrollView
      style={{ backgroundColor: "#0E133C" }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <LinearGradient
        style={{ width: "100%" }}
        colors={[gradientFrom, gradientTo]}
      >
        <Text style={styles.h1}>Information</Text>
        <Image
          source={image}
          style={{
            width: 400,
            alignSelf: "center",
            height: 520,
            resizeMode: "contain",
          }}
        />
        <Text style={styles.h2}>{content}</Text>
        <ButtonComponent title={name} onPress={press} />
      </LinearGradient>
    </ScrollView>
  );
}
