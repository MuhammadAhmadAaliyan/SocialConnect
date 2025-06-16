import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //Load data from memory.
  useFocusEffect(() => {
    let loadData = async () => {
      try {
        const profileImage = await AsyncStorage.getItem("@profileImage");
        if (profileImage) {
          setProfileImage(profileImage);
        } else {
          setProfileImage("");
        }
      } catch (e) {
        console.log("An error occurred while saving data.");
        console.log(e);
      }
    };

    loadData();
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Social Connect</Text>
        <Pressable onPress={() => navigation.navigate("ProfileScreen")}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <Image
              source={require("../assets/Default Avatar.jpg")}
              style={styles.avatar}
            />
          )}
        </Pressable>
      </View>
      <View
        style={{
          height: 1,
          backgroundColor: "#E0E0E0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 1,
          elevation: 1,
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: "4%",
    paddingTop: "12%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontFamily: "DancingScriptBold",
    color: "#4F46E5",
    fontSize: 26,
    letterSpacing: 6,
  },
  avatar: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderRadius: 30,
  },
});
