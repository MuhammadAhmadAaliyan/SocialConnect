import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useRoute } from "@react-navigation/native";

const UserInfoScreen = () => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();
  const [userName, setuserName] = React.useState<string>("");
  const [bio, setBio] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const route = useRoute();

  //MOCK API URL
  const MOCK_API_USER_URL =
    "https://socialconnect-backend-production.up.railway.app/users";

//fetch user Info.
React.useEffect(() => {
    let fetchUserInfo = async () => {
    try{
        const {userId} = route.params as {userId: string};

        const response = await fetch(MOCK_API_USER_URL);

        if(!response.ok){
            console.log("Unable to fetch users.");
            return;
        }

        const data = await response.json();
        const user = data.find((user: any) => user.id === userId);

        setuserName(user.name);
        setProfileImage(user.avatar);
        setBio(user.bio);
    }catch(e){
        console.log("An error occurred while fetching user info.");
    }finally{
        setLoading(false);
    }
}

fetchUserInfo();
}, []);

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (loading)
    return (
      <View style={{backgroundColor: '#ffffff', flex: 1}}>
        <ActivityIndicator
          size={"large"}
          color={"#4F46E5"}
          style={{ marginTop: 100 }}
        />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileArea}>
          <Text style={styles.profileText}>Profile</Text>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require("../assets/Default Avatar.jpg")}
                style={styles.profileImage}
              />
            )}
          </View>
          <Text style={{ fontSize: 22, fontFamily: "PoppinsMedium" }}>
            Name:
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.info}>{userName}</Text>
          </View>
          <Text style={{ fontSize: 22, fontFamily: "PoppinsMedium" }}>
            Bio:
          </Text>
          <View style={styles.infoContainer}>
            <Text
              style={[styles.info, !bio && { color: "#D3D3D3" }]}
              numberOfLines={0}
            >
              {bio ? bio : "No Bio"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  profileArea: {
    padding: "4%",
  },
  profileText: {
    fontSize: 26,
    fontFamily: "PoppinsRegular",
    letterSpacing: 4,
    textAlign: "center",
    paddingTop: "8%",
  },
  profileImageContainer: {
    marginBottom: "12%",
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignSelf: "center",
    marginTop: "8%",
  },
  infoContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#4F46E5",
    borderRadius: 15,
    marginVertical: "6%",
    padding: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "nowrap",
  },
  info: {
    fontSize: 20,
    fontFamily: "PoppinsRegular",
    flexShrink: 1,
    flexGrow: 1,
    flex: 1,
    flexWrap: "wrap",
    paddingRight: 10,
  },

});
