import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { usePosts } from "../contexts/PostsContext";
import { useAuth } from "../contexts/AuthContext";
import Post from "./Post";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

const HomeScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const { posts, setPosts, likePost, unlikePost } = usePosts();
  const [userId, setUserId] = React.useState<string | null>(null);
  const auth = useAuth();

  //MOCK_API_POST_URL
  const MOCK_API_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/posts";

  //MOCK_API_USER_URL;
  const MOCK_API_USER_URL =
    "https://socialconnect-backend-production.up.railway.app/users";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //fetch Posts from backend.
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const [postResponse, userResponse] = await Promise.all([
        fetch(MOCK_API_POST_URL),
        fetch(MOCK_API_USER_URL),
      ]);
      if (!postResponse.ok || !userResponse.ok) {
        console.log("An error occur while fetching!!");
        return;
      }

      const posts = await postResponse.json();
      const users = await userResponse.json();

      const mergedResponse = posts
        .map((post: any) => {
          const user = users.find((u: any) => u.id == post.userId);
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
      const userId = await AsyncStorage.getItem("@userId");
      if (userId) setUserId(userId);
    } catch (e) {
      console.log("Error fetching posts:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

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
            await AsyncStorage.setItem("@userName", userName);
          }
          if (bio) {
            await AsyncStorage.setItem("@bio", bio);
          }
          if (profileImage) {
            await AsyncStorage.setItem("@profileImage", profileImage);
          }
          if (userId) {
            await AsyncStorage.setItem("@userId", userId);
            console.log(userId);
          }
        }
      } catch (e) {
        console.log("An error occurred while saving data");
          Alert.alert("Network Error", "No internet connection.");
      }
    };

    saveData();
  }, [auth.user]);

  //Refresh Posts when user create new Post.
  useFocusEffect(
    React.useCallback(() => {
      const checkRefresh = async () => {
        const shouldRefresh = await AsyncStorage.getItem("@shouldRefreshPosts");
        if (shouldRefresh === "true") {
          await AsyncStorage.removeItem("@shouldRefreshPosts");
          fetchPosts();
        }
      };
      checkRefresh();
    }, []),
  );

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

  let renderItem = ({ item }: any) => (
    <Post
    item={item}
    userId={userId}
    navigation={navigation}
    likePost={likePost}
    unlikePost={unlikePost}
    />
  );

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
      <View style={styles.header}>
        <Text style={styles.logo}>Social Connect</Text>
        <Pressable onPress={() => navigation.navigate("ProfileScreen")}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <Image
              source={require("../assets/Default Avatar.jpg")}
              style={styles.avatar}
              resizeMode={"contain"}
            />
          )}
        </Pressable>
      </View>
      <View style={styles.borderLine} />
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPosts}
            colors={["#4F46E5"]}
            tintColor={"#4F46E5"}
          />
        }
        onRefresh={fetchPosts}
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
    padding: hp(2),
    paddingTop: hp(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontFamily: "DancingScriptBold",
    color: "#4F46E5",
    fontSize: rf(3.3),
    letterSpacing: 6,
  },
  avatar: {
    width: wp(12.5),
    height: hp(5.96),
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderRadius: hp(3.97),
  },
  borderLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp(0.13) },
    shadowOpacity: 0.08,
    shadowRadius: hp(0.13),
    elevation: 1,
  },
});
