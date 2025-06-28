import * as React from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

  //Calculate Image dimension
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.9;
  const imageHeight = (screenWidth * 5) / 4;

const CreatePostScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [userAvatar, setUserAvatar] = React.useState<string>();
  const [userName, setUserName] = React.useState<string>();
  const [postText, setPostText] = React.useState<any>();
  const [postImage, setPostImage] = React.useState<string>();
  const [isButtonPressed, setButtonPressed] = React.useState(false);
  const isNavigating = React.useRef(false);

  //MOCK_API_POST_URL
  const MOCK_API_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/create-post";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  React.useEffect(() => {
    const loadData = async () => {
      const userAvatar = await AsyncStorage.getItem("@profileImage");
      const userName = await AsyncStorage.getItem("@userName");
      if (userAvatar) {
        setUserAvatar(userAvatar);
      } else {
        setUserAvatar("");
      }
      if (userName) setUserName(userName);
    };

    loadData();
  }, []);

  if (!loaded && !error) {
    return null;
  }

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
        aspect: [4, 5],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPostImage(uri);
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

      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPostImage(uri);
      }
    } catch (e) {
      console.log("An error occurred while choosing image.");
      console.log(e);
    }
  };

  //Upload image to cloudinary
  let uploadImageToCloudnary = async (imageUri: any) => {
    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "postImage.jpeg",
      } as any);

      data.append("upload_preset", "my_uploads");
      data.append("cloud_name", "dofkcofc1");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dofkcofc1/image/upload",
        {
          method: "POST",
          body: data,
        },
      );

      const result = await response.json();
      if (result.secure_url) {
        console.log(result.secure_url);
        return result.secure_url;
      } else {
        console.error("Cloudinary upload failed:", result);
        return null;
      }
    } catch (e) {
      console.log("Failed to upload in Cloudinary.");
      console.log(e);
    }
  };

  //Create post function.
  let createPost = async () => {
    try {
      const userId = await AsyncStorage.getItem("@userId");

      let imageUri = "";
      if (postImage) {
        imageUri = await uploadImageToCloudnary(postImage);
      }

      const newPost = {
        userId,
        text: postText,
        image: imageUri,
      };

      const response = await fetch(MOCK_API_POST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (response.status == 201) {
        console.log("Post created Successfully.");
        isNavigating.current = true;
        setButtonPressed(false);
        await AsyncStorage.setItem('@shouldRefreshPosts', "true");
        navigation.reset({
          index: 0,
          routes: [{ name: "Tabs" }],
        });
      } else {
        console.log("Failed while fetching.");
        console.log(response.status);
        setButtonPressed(false);
      }
    } catch (e) {
      console.log("An error occurred while creating post");
      console.log(e);
    }
  };

  //handle delete
  let handleDelete = () => {
    Alert.alert(
      "Delete Picture.",
      "Are you sure you want to delete Picture?",
      [
        {
          text: "Cancel",
          style: "default",
          onPress: () => null,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setPostImage(""),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.userInfo}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              resizeMode={"contain"}
              style={styles.profileImage}
            />
          ) : (
            <Image
              source={require("../assets/Default Avatar.jpg")}
              resizeMode={"contain"}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.postContainer}>
          <TextInput
            value={postText}
            onChangeText={(text) => setPostText(text)}
            style={styles.input}
            placeholder={"What's going on your mind?"}
            keyboardType="default"
            multiline
            maxLength={60}
          />
        </View>
        <Text style={{ fontSize: 18, fontFamily: "PoppinsBold" }}>
          Image (Optional):
        </Text>
        {postImage ? (
          <>
            <Image
              source={{ uri: postImage }}
              resizeMode={"cover"}
              style={styles.postImage}
            />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PoppinsBold",
                marginTop: "10%",
              }}
            >
              Edit Image:
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={() => takingPicture()}
              >
                <Ionicons name={"camera"} size={20} color={"#4F46E5"} />
                <Text style={[styles.text, { fontSize: 14 }]}>Camera</Text>
              </Pressable>
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={() => selectPicture()}
              >
                <Ionicons name={"image"} size={20} color={"#4F46E5"} />
                <Text style={[styles.text, { fontSize: 14 }]}>Gallery</Text>
              </Pressable>
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name={"delete"}
                  size={20}
                  color={"#4F46E5"}
                />
                <Text style={[styles.text, { fontSize: 14 }]}>Delete</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Pressable
              style={styles.imageContainer}
              onPress={() => takingPicture()}
            >
              <Ionicons name={"camera"} size={30} color={"#4F46E5"} />
              <Text style={styles.text}>Camera</Text>
            </Pressable>
            <Pressable
              style={styles.imageContainer}
              onPress={() => selectPicture()}
            >
              <Ionicons name={"image"} size={30} color={"#4F46E5"} />
              <Text style={styles.text}>Gallery</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          style={[
            styles.sendButton,
            ((!postText?.trim() && !postImage) || isButtonPressed) && {
              borderColor: "#CCCCCC",
              backgroundColor: "#CCCCCC",
            },
          ]}
          disabled={(!postText?.trim() && !postImage) || isButtonPressed}
          onPress={() => {
            createPost();
            setButtonPressed(true);
          }}
        >
          {isButtonPressed ? (
            <ActivityIndicator color={"#ffffff"} size={28} />
          ) : (
            <MaterialCommunityIcons
              name={"send"}
              size={25}
              color={"#ffffff"}
              style={!postText?.trim() && !postImage && { opacity: 0.6 }}
            />
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  userInfo: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontFamily: "PoppinsMedium",
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: 70,
    borderRadius: 12,
    padding: 10,
    fontSize: 18,
    fontFamily: "PoppinsRegular",
  },
  postContainer: {
    paddingVertical: "10%",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginVertical: 10,
    marginTop: "10%",
    backgroundColor: "#F6F6F6",
    padding: 20,
    borderRadius: 15,
    width: 120,
  },
  imageContainer2: {
    padding: 10,
    width: 100,
  },
  text: {
    fontSize: 18,
    fontFamily: "PoppinsMedium",
  },
  postImage: {
    width: imageWidth,
    height: imageHeight,
    marginTop: "10%",
    alignSelf: "center",
    borderRadius: 15,
  },
  sendButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    height: 45,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: "10%",
    marginTop: "30%",
  },
});
