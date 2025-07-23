import * as React from "react";
import {
  View,
  SafeAreaView,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

const SettingScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [modalText, setModalText] = React.useState("");
  const auth = useAuth();

  //MOCK_API_DELETE_URL
  const MOCK_API_DELETE_URL =
    "https://socialconnect-backend-production.up.railway.app/delete";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  //handle Log out
  let handleLogout = async () => {
    try {
      setModalVisible(true);

      setTimeout(async () => {
        auth.logout();
        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });
      }, 2000);
    } catch (e) {
      console.log("Log out error.");
      console.log(e);
    }
  };

  //handle Delete Account
  let handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account permanently?",
      [
        {
          text: "Cancel",
          style: "default",
          onPress: () => null,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount(),
        },
      ],
      { cancelable: true },
    );
  };
  let deleteAccount = async () => {
    try {
      setModalVisible(true);
      const userId = await AsyncStorage.getItem("@userId");
      const response = await fetch(`${MOCK_API_DELETE_URL}/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.log("Response Error", response.status);
        return;
      }

      if (response.status == 200) {
        console.log("Deletion Successful.");
        setModalVisible(false);
        Alert.alert("Success", "Your account has been successfully deleted.");
        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });
        await AsyncStorage.clear();
        auth.login(null);
      } else {
        setModalVisible(false);
        console.log(response.status);
      }
    } catch (e) {
      console.log("Deletion Error");
      console.log(e);
        Alert.alert("Network Error", "No internet connection.");
      setModalVisible(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => {
          handleLogout();
          setModalText("Logging out...");
        }}
      >
        <MaterialCommunityIcons
          name={"logout"}
          size={rf(3.25)}
          color={"#4F46E5"}
        />
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
      <View style={styles.borderLine} />
      <Pressable
        style={styles.button}
        onPress={() => {
          handleDelete();
          setModalText("Deleting Account...");
        }}
      >
        <MaterialCommunityIcons
          name={"delete"}
          size={rf(3.25)}
          color={"#4F46E5"}
        />
        <Text style={[styles.buttonText, { color: "red" }]}>
          Delete Account
        </Text>
      </Pressable>
      <View style={styles.borderLine} />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.modalText}>{modalText}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    gap: 6,
  },
  buttonText: {
    fontSize: rf(2.45),
    fontFamily: "PoppinsRegular",
  },
  borderLine: {
    height: 0.5,
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 0.5,
    elevation: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: hp(3.18),
    paddingHorizontal: wp(4.18),
    borderRadius: rf(1.59),
    alignItems: "center",
  },
  modalText: {
    marginTop: hp(1.59),
    fontSize: rf(2.11),
    fontFamily: "PoppinsMedium",
    color: "#333",
  },
});
