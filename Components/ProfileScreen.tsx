import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();
  const [pModalVisible, setPModalVisible] = React.useState(false);
  const [infoModalVisible, setInfoModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState("");
  const [userName, setuserName] = React.useState<string>("");
  const [bio, setBio] = React.useState<string>("");
  const auth = useAuth();

  //MOCK API URL
  const MOCK_API_AUTH_URL =
    "https://socialconnect-backend-production.up.railway.app/user";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //Name and Bio validation Schema.
  let validationSchema = Yup.object().shape({
    name: Yup.string()
      .max(30, "Name can't exceed 30 characters")
      .required("Name is required."),
    bio: Yup.string().max(100, "Bio can't exceed 100 characters."),
  });

  //Save data into  memory.
  React.useEffect(() => {
    let saveData = async () => {
      try {
        if (auth.user && auth.user.user) {
          const userName = auth.user.user.name;
          const bio = auth.user.user.bio;
          const profileImage = auth.user.user.avatar;
          const userId = auth.user.user.id;

          if (userName) {
            setuserName(userName);
            await AsyncStorage.setItem("@userName", userName);
          }
          if (bio) {
            setBio(bio);
            await AsyncStorage.setItem("@bio", bio);
          }
          if (profileImage) {
            setProfileImage(profileImage);
            await AsyncStorage.setItem("@profileImage", profileImage);
          }
          if (userId) {
            await AsyncStorage.setItem("@userId", userId);
            console.log(userId);
          }
        }
      } catch (e) {
        console.log("An error occurred while saving data");
      }
    };

    saveData();
  }, [auth.user]);

  //Load data from memory.
  let loadData = async () => {
    try {
      const userName = await AsyncStorage.getItem("@userName");
      const bio = await AsyncStorage.getItem("@bio");
      const profileImage = await AsyncStorage.getItem("@profileImage");

      if (userName) setuserName(userName);
      if (bio) setBio(bio);
      if (profileImage) {
        setProfileImage(profileImage);
      } else {
        setProfileImage("");
      }
    } catch (e) {
      console.log("An error occurred while loading data.");
      console.log(e);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  //Update Profile function.
  let updateProfile = async (updates: {
    name?: string;
    bio?: string;
    avatar?: string;
  }) => {
    try {
      const userId = await AsyncStorage.getItem('@userId');
      console.log(userId);

      const response = await fetch(`${MOCK_API_AUTH_URL}/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.status == 200) {
        console.log("Changes update Successfully.");
      } else {
        console.log(response.status);
      }
    } catch (e) {
      console.log("Upadate failed.");
      console.log(e);
    }
  };

  //handle Camera function.
  let takingPicture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow camera access");
        return null;
      }

      const result: any = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem("@profileImage", uri);
        await updateProfile({avatar: result});
      }
    } catch (e) {
      console.log("An error while taking picture!!");
      console.log(e);
    }
  };

  //handle Gallery function.
  let selectPicture = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow gallery access.");
      }

      const result:any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem("@profileImage", uri);
        await updateProfile({avatar: result})
      }
    } catch (e) {
      console.log("An error occurred while choosing image.");
      console.log(e);
    }
  };

  //Delete profile image function.
  let handleDelete = () => {
    Alert.alert(
      "Delete Profile Picture.",
      "Are you sure you want to delete profile picture?",
      [
        {
          text: "Cancel",
          style: "default",
          onPress: () => null,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProfileImage("");
              await AsyncStorage.removeItem("@profileImage");
              await updateProfile({avatar: ""});
            } catch (e) {
              console.log("An error occurred while deleting");
              console.log(e);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  //Save edit function
  let saveEdit = async (newName: string, newBio: string) => {
    try {
      if(modalType == "Name"){
        setuserName(newName)
        await AsyncStorage.setItem('@userName', newName);
        await updateProfile({name: newName});
      }else if(modalType == "Bio"){
        const bio = newBio? newBio: "";
        setBio(bio);
        await AsyncStorage.setItem('@bio', bio);
        await updateProfile({bio: bio});
      }
    } catch (e) {
      console.log("An error occurred while saving", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"arrow-back"} size={20} color={"#ffffff"} />
        </Pressable>
        <Text style={styles.logo}>Social Connect</Text>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <Image
            source={require("../assets/Default Avatar.jpg")}
            style={styles.avatar}
          />
        )}
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
            <Pressable
              style={styles.editButton}
              onPress={() => setPModalVisible(true)}
            >
              <MaterialIcons name={"edit"} size={20} color={"#ffffff"} />
            </Pressable>
          </View>
          <Text style={{ fontSize: 22, fontFamily: "PoppinsMedium" }}>
            Name:
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.info}>{userName}</Text>
            <MaterialIcons
              name={"edit"}
              size={20}
              style={{ alignSelf: "center" }}
              onPress={() => {
                setInfoModalVisible(true);
                setModalType("Name");
              }}
            />
          </View>
          <Text style={{ fontSize: 22, fontFamily: "PoppinsMedium" }}>
            Bio:
          </Text>
          <View style={styles.infoContainer}>
            <Text
              style={[styles.info, !bio && { color: "#D3D3D3" }]}
              numberOfLines={0}
            >
              {bio ? bio : "Add your Bio"}
            </Text>
            <MaterialIcons
              name={"edit"}
              size={20}
              onPress={() => {
                setInfoModalVisible(true);
                setModalType("Bio");
              }}
              style={{ alignSelf: "center" }}
            />
          </View>
        </View>
      </ScrollView>
      <Modal
        isVisible={pModalVisible}
        onBackdropPress={() => setPModalVisible(false)}
        onSwipeComplete={() => setPModalVisible(false)}
        swipeDirection="down"
        style={styles.modal}
        backdropOpacity={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.handleBar} />
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPModalVisible(false)}>
              <Ionicons name="close" size={26} color="black" />
            </Pressable>
            <Text style={styles.title}>Profile photo</Text>
            <Pressable
              onPress={() => {
                setPModalVisible(false);
                handleDelete();
              }}
              disabled={!profileImage}
            >
              <MaterialIcons
                name="delete-outline"
                size={24}
                color={!profileImage ? "#D3D3D3" : "black"}
              />
            </Pressable>
          </View>
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => {
                takingPicture();
                setPModalVisible(false);
              }}
            >
              <Ionicons name="camera" size={26} color="#4F46E5" />
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => {
                selectPicture();
                setPModalVisible(false);
              }}
            >
              <Ionicons name="image" size={26} color="#4F46E5" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={infoModalVisible}
        onBackdropPress={() => setInfoModalVisible(false)}
        statusBarTranslucent
        backdropOpacity={0.5}
        style={styles.infoModal}
      >
        <View style={styles.infoModalContent}>
          <Formik
            initialValues={{ name: userName, bio: bio }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              saveEdit(values.name, values.bio);
              setInfoModalVisible(false);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              errors,
              values,
              touched,
            }) => (
              <>
                <Text style={{ fontSize: 20, fontFamily: "PoppinsMedium" }}>
                  Edit {modalType}:
                </Text>
                {modalType == "Name" && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={values.name}
                      placeholder="Enter new Name"
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      maxLength={30}
                      style={styles.input}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.inputLength}>
                        {values.name?.length}/30
                      </Text>
                      {touched.name && errors.name && (
                        <Text style={styles.error}>{errors.name}</Text>
                      )}
                    </View>
                  </View>
                )}
                {modalType == "Bio" && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      multiline
                      value={values.bio}
                      returnKeyType={"default"}
                      placeholder="Add your Bio"
                      onChangeText={handleChange("bio")}
                      onBlur={handleBlur("bio")}
                      maxLength={100}
                      style={styles.input}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.inputLength}>
                        {values.bio?.length}/100
                      </Text>
                      {touched.name && errors.name && (
                        <Text style={styles.error}>{errors.name}</Text>
                      )}
                    </View>
                  </View>
                )}
                <Pressable
                  style={styles.saveButton}
                  onPress={() => handleSubmit()}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </>
            )}
          </Formik>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
  backButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    height: 45,
    width: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  avatar: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderRadius: 30,
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
  editButton: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    height: 45,
    width: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    bottom: 0,
    right: "30%",
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
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderWidth: 1,
    borderColor: "#F6F6F6",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,

    //Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
  handleBar: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "PoppinsBold",
    color: "#000",
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionBox: {
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    padding: 20,
    borderRadius: 15,
    width: 100,
  },
  optionText: {
    marginTop: 10,
    fontFamily: "PoppinsRegular",
  },
  infoModal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  infoModalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },
  inputContainer: {
    paddingVertical: "6%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: 45,
    padding: 8,
    fontSize: 18,
    borderRadius: 12,
    fontFamily: "PoppinsRegular",
  },
  inputLength: {
    position: "absolute",
    left: "90%",
    fontFamily: "PoppinsRegular",
  },
  saveButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: 10,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    marginVertical: "5%",
  },
  saveButtonText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
});
