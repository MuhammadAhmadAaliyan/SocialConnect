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
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";
import Swiper from "react-native-swiper";
import { useRoute } from "@react-navigation/native";

//Calculate Image dimension
const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = (screenWidth * 5) / 4;

const EditPostScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [userAvatar, setUserAvatar] = React.useState<string>();
  const [userName, setUserName] = React.useState<string>();
  const [postText, setPostText] = React.useState<any>();
  const [postImages, setPostImages] = React.useState<string[]>([]);
  const [isButtonPressed, setButtonPressed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const isNavigating = React.useRef(false);
  const route = useRoute();

  //MOCK_API_POST_URL
  const MOCK_API_UPDATE_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/edit-post";

  const { postId } = route.params as { postId: string };

  //fetch post.
  React.useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://socialconnect-backend-production.up.railway.app/posts",
        );
        if (!response.ok) {
          console.error("An error occurred while fetching", response.status);
        }

        const posts = await response.json();
        const post = posts.find((p: any) => p.id == postId);
        setPostText(post.text);
        setPostImages(post.images);
      } catch (e) {
        console.log("Error: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, []);

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
        setPostImages(uri);
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
        allowsMultipleSelection: true,
        aspect: [4, 5],
        quality: 0.7,
      });

      if (!result.canceled) {
        const selectedAssets = result.assets;
        if (selectedAssets.length > 5) {
          Alert.alert("Alert", "You can only select 5 Images.");
          return;
        }
        const uris = selectedAssets.map((asset: any) => asset.uri);
        setPostImages(uris);
      }
    } catch (e) {
      console.log("An error occurred while choosing image.");
      console.log(e);
    }
  };

  //Upload image to cloudinary
  let uploadImagesToCloudinary = async (imageUris: string[]) => {
    try {
      const uploadedUrls: string[] = [];

      for (const uri of imageUris) {
        const data = new FormData();
        data.append("file", {
          uri,
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
          uploadedUrls.push(result.secure_url);
        } else {
          console.error("Cloudinary upload failed for one image:", result);
        }
      }

      return uploadedUrls;
    } catch (e) {
      console.log("Failed to upload images to Cloudinary.");
      console.log(e);
      return [];
    }
  };

  //Create post function.
  let editPost = async () => {
    try {
      let imageUrls: string[] = [];
      if (postImages && postImages.length > 0) {
        imageUrls = await uploadImagesToCloudinary(postImages);
      }

      const newPost = {
        text: postText,
        images: imageUrls,
      };

      const response = await fetch(`${MOCK_API_UPDATE_POST_URL}/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        console.log("Response Error", response.status);
        return;
      }

      if (response.status === 200) {
        console.log("Post Updated successfully.");
        isNavigating.current = true;
        setButtonPressed(false);
        await AsyncStorage.setItem("@shouldRefreshPosts", "true");
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
      Alert.alert("Network Error", "No internet connection.");
      setButtonPressed(false);
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
          onPress: () => setPostImages([]),
        },
      ],
      { cancelable: true },
    );
  };

  if (loading)
    return (
      <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <ActivityIndicator
          size={"large"}
          color={"#4F46E5"}
          style={{ marginTop: hp(13.2) }}
        />
      </View>
    );

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
        <Text style={{ fontSize: rf(2.2), fontFamily: "PoppinsBold" }}>
          Image (Optional):
        </Text>
        {postImages.length > 0 ? (
          <>
            <Swiper
              showsPagination={true}
              loop={false}
              dotColor="#ccc"
              activeDotColor="#4F46E5"
              style={{ height: imageHeight + hp(6.62) }}
            >
              {postImages.map((uri, index) => (
                <View key={index} style={{ alignItems: "center" }}>
                  <Image
                    source={{ uri }}
                    resizeMode="cover"
                    style={styles.postImage}
                  />
                </View>
              ))}
            </Swiper>

            <Text
              style={{
                fontSize: rf(2.2),
                fontFamily: "PoppinsBold",
                marginTop: hp(3),
              }}
            >
              Edit Images:
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: hp(3),
              }}
            >
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={takingPicture}
              >
                <Ionicons name="camera" size={rf(2.4)} color="#4F46E5" />
                <Text style={[styles.text, { fontSize: rf(1.7) }]}>Camera</Text>
              </Pressable>
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={selectPicture}
              >
                <Ionicons name="image" size={rf(2.4)} color="#4F46E5" />
                <Text style={[styles.text, { fontSize: rf(1.7) }]}>
                  Gallery
                </Text>
              </Pressable>
              <Pressable
                style={[styles.imageContainer, styles.imageContainer2]}
                onPress={handleDelete}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={20}
                  color="#4F46E5"
                />
                <Text style={[styles.text, { fontSize: rf(1.7) }]}>Delete</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: hp(3),
            }}
          >
            <Pressable style={styles.imageContainer} onPress={takingPicture}>
              <Ionicons name="camera" size={rf(3.42)} color="#4F46E5" />
              <Text style={styles.text}>Camera</Text>
            </Pressable>
            <Pressable style={styles.imageContainer} onPress={selectPicture}>
              <Ionicons name="image" size={rf(3.42)} color="#4F46E5" />
              <Text style={styles.text}>Gallery</Text>
            </Pressable>
          </View>
        )}
        <Pressable
          style={[
            styles.sendButton,
            ((!postText?.trim() && !postImages) || isButtonPressed) && {
              borderColor: "#CCCCCC",
              backgroundColor: "#CCCCCC",
            },
          ]}
          disabled={(!postText?.trim() && !postImages) || isButtonPressed}
          onPress={() => {
            editPost();
            setButtonPressed(true);
          }}
        >
          {isButtonPressed ? (
            <ActivityIndicator color={"#ffffff"} size={rf(3.5)} />
          ) : (
            <MaterialCommunityIcons
              name={"send"}
              size={25}
              color={"#ffffff"}
              style={!postText?.trim() && !postImages && { opacity: 0.6 }}
            />
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: hp(1.32),
    paddingHorizontal: wp(2.78),
  },
  userInfo: {
    flexDirection: "row",
    gap: wp(1.39),
    alignItems: "center",
  },
  profileImage: {
    width: wp(11.11),
    height: hp(5.29),
    borderRadius: hp(2.65),
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  userName: {
    fontFamily: "PoppinsMedium",
    fontSize: rf(2.2),
  },
  input: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: hp(9.27),
    borderRadius: hp(1.59),
    paddingVertical: hp(1.32),
    paddingHorizontal: wp(2.78),
    fontSize: rf(2.2),
    fontFamily: "PoppinsRegular",
  },
  postContainer: {
    paddingVertical: hp(5),
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: wp(1.67),
    marginVertical: hp(1.32),
    marginTop: hp(5),
    backgroundColor: "#F6F6F6",
    paddingHorizontal: wp(5.56),
    paddingVertical: hp(2.65),
    borderRadius: rf(1.99),
    width: wp(33.33),
  },
  imageContainer2: {
    paddingVertical: hp(1.32),
    paddingHorizontal: wp(2.78),
    width: wp(27.78),
  },
  text: {
    fontSize: rf(2.2),
    fontFamily: "PoppinsMedium",
  },
  postImage: {
    width: imageWidth,
    height: imageHeight,
    marginTop: hp(5),
    alignSelf: "center",
    borderRadius: hp(1.99),
  },
  sendButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    height: hp(5.96),
    paddingVertical: hp(1.32),
    paddingHorizontal: wp(2.78),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp(1.59),
    marginVertical: hp(5),
    marginTop: hp(15),
  },
});
