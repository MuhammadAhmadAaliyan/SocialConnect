import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePosts } from "../contexts/PostsContext";

import Post from "./Post";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserInfoScreen = ({ navigation }: any) => {
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
  const [buttonText, setButtonText] = React.useState("Following");
  const { posts, setPosts, likePost, unlikePost } = usePosts();
  const [currentUserId, setCurrentUserId] = React.useState<any>();
  const [postCount, setPostCount] = React.useState<any>();
  const [followersCount, setFollowersCount] = React.useState<any>();
  const [followingsCount, setFollowingsCount] = React.useState<any>();
  const [followers, setFollowers] = React.useState<any>([]);
  const route = useRoute();
  const insets = useSafeAreaInsets();

  //MOCK API URL
  const MOCK_API_USER_URL =
    "https://socialconnect-backend-production.up.railway.app/specific-user";

  const MOCK_API_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/own-post";

  const { userId } = route.params as { userId: string };
  //fetch user Info.
  React.useEffect(() => {
    let fetchUserInfo = async () => {
      try {
        const userResponse = await fetch(`${MOCK_API_USER_URL}/${userId}`);
        const postResponse = await fetch(`${MOCK_API_POST_URL}/${userId}`);
        const currentUserId = await AsyncStorage.getItem("@userId");

        if (!userResponse.ok) {
          console.log("Unable to fetch users.");
          return;
        }
        if (!postResponse.ok) {
          console.log("Unable to fetch users.");
          return;
        }

        const user = await userResponse.json();
        const posts = await postResponse.json();

        const mergedResponse = posts
          .map((post: any) => {
            return {
              ...post,
              user: user || {},
            };
          })
          .sort(
            (a: any, b: any) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );

        setPosts(mergedResponse);

        setuserName(user.name);
        setProfileImage(user.avatar);
        setBio(user.bio);
        setPostCount(user.postCount);
        setFollowersCount(user.followers.length);
        setFollowingsCount(user.followings.length);
        setCurrentUserId(currentUserId);
        setFollowers(user.followers);
        await AsyncStorage.setItem("@shouldRefreshPosts", "true");
      } catch (e) {
        console.log("An error occurred while fetching user info.");
        Alert.alert("Network Error", "No internet connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  React.useLayoutEffect(() => {
    if (userName) {
      navigation.setOptions({
        title: userName,
      });
    }
  }, [navigation, userName]);

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
      <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <ActivityIndicator
          size={"large"}
          color={"#4F46E5"}
          style={{ marginTop: hp(13.2) }}
        />
      </View>
    );

  let renderItem = ({ item }: any) => (
    <Post
      item={item}
      userId={currentUserId}
      navigation={navigation}
      likePost={likePost}
      unlikePost={unlikePost}
    />
  );

  let handleFollowButton = async () => {
    const isAlreadyFollow = followers.includes(currentUserId);
    try {
      if (isAlreadyFollow) {
        setButtonText("Follow");
        setFollowers((prevFollowers: any) =>
          prevFollowers.filter((id: any) => id !== currentUserId),
        );
        setFollowersCount((prev: any) => prev - 1);
      } else {
        setButtonText("Following");
        setFollowers((prevFollowers: any) => [...prevFollowers, currentUserId]);
        setFollowersCount((prev: any) => prev + 1);
      }

      const response = await fetch(
        "https://socialconnect-backend-production.up.railway.app/connections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, currentUserId }),
        },
      );

      if (response.status == 200) {
        const data = await response.json();
        console.log(data.message);
      } else {
        response.status;
      }
    } catch (e) {
      console.log("Error", e);
      if (isAlreadyFollow) {
        setButtonText("Follow");
        setFollowers((prevFollowers: any) =>
          prevFollowers.filter((id: any) => id !== currentUserId),
        );
        setFollowersCount((prev: any) => prev + 1);
      } else {
        setButtonText("Following");
        setFollowers((prevFollowers: any) => [...prevFollowers, currentUserId]);
        setFollowersCount((prev: any) => prev - 1);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.shadow} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileArea}>
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
            <View style={{ paddingHorizontal: wp(4.5) }}>
              <Text style={[styles.info, { top: hp(5) }]}>{userName}</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: wp(60),
                  top: "-6%",
                }}
              >
                <View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "PoppinsRegular",
                    }}
                  >
                    {postCount}
                  </Text>
                  <Text style={{ fontFamily: "PoppinsMedium" }}>Posts</Text>
                </View>
                <View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "PoppinsRegular",
                    }}
                  >
                    {followersCount}
                  </Text>
                  <Text style={{ fontFamily: "PoppinsMedium" }}>Followers</Text>
                </View>
                <View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "PoppinsRegular",
                    }}
                  >
                    {followingsCount}
                  </Text>
                  <Text style={{ fontFamily: "PoppinsMedium" }}>
                    Followings
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text
            style={[styles.info, !bio && { color: "#D3D3D3" }]}
            numberOfLines={0}
          >
            {bio ? bio : "No Bio"}
          </Text>
        </View>
        {userId !== currentUserId ? (
          buttonText == "Follow" ? (
            <>
              <Pressable
                style={[styles.button, { marginHorizontal: wp(4) }]}
                onPress={() => handleFollowButton()}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: wp(4),
                }}
              >
                <Pressable
                  style={[styles.button, { backgroundColor: "#ffffff" }]}
                  onPress={() => handleFollowButton()}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { fontSize: rf(2), color: "#4F46E5" },
                    ]}
                  >
                    {buttonText}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    { flexDirection: "row", alignItems: "center", gap: 6 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={"chat"}
                    color={"#ffffff"}
                    size={20}
                  />
                  <Text style={[styles.buttonText, { fontSize: rf(2) }]}>
                    Message
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  marginTop: "20%",
                  borderTopWidth: 5,
                  borderColor: "#D9D9D9",
                }}
              >
                <FlatList
                  data={posts}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  initialNumToRender={5}
                  maxToRenderPerBatch={5}
                />
              </View>
            </>
          )
        ) : (
          <View
            style={{
              marginTop: "20%",
              borderTopWidth: 5,
              borderColor: "#D9D9D9",
            }}
          >
            <FlatList
              data={posts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
            />
          </View>
        )}
        <View style={{ paddingBottom: insets.bottom + hp(0.5) }} />
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
    paddingHorizontal: wp(4),
    paddingVertical: hp(4),
    paddingTop: hp(2),
    //height: hp(35),
  },
  profileText: {
    fontSize: 26,
    fontFamily: "PoppinsRegular",
    letterSpacing: 4,
    textAlign: "center",
    paddingTop: hp(4),
  },
  profileImageContainer: {
    marginBottom: hp(6),
    flexDirection: "row",
  },
  profileImage: {
    width: hp(13),
    height: hp(13),
    borderRadius: hp(10),
    borderWidth: 2,
    borderColor: "#4F46E5",
    //alignSelf: "center",
    marginTop: hp(4),
  },
  info: {
    fontSize: rf(2.45),
    fontFamily: "PoppinsRegular",
    flexShrink: 1,
    flexGrow: 1,
    flex: 1,
    flexWrap: "wrap",
    paddingRight: wp(2.78),
  },
  button: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: hp(1),
    height: hp(6),
    borderRadius: hp(1.59),
    justifyContent: "center",
    alignItems: "center",
    top: hp(3),
  },
  buttonText: {
    fontSize: rf(2.8),
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
  shadow: {
    height: hp(0.13),
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.13) },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
});
