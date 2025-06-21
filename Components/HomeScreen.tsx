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
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();
  const [posts, setPosts] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState("");

  //Post URL.
  const POST_URL =
    "https://socialconnect-backend-production.up.railway.app/posts";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //fetch Posts from backend.
const fetchPosts = async () => {
  setLoading(true);
  try {
    const res = await fetch(POST_URL);
    const data = await res.json();

    const likedData = await AsyncStorage.getItem("@likedPosts");
    const unlikedData = await AsyncStorage.getItem("@unlikedPosts");
    const likedPosts = likedData ? JSON.parse(likedData) : [];
    const unlikedPosts = unlikedData ? JSON.parse(unlikedData) : [];

    // Apply button state from AsyncStorage
    const enrichedPosts = data.map((post: any) => ({
      ...post,
      likedBy: likedPosts.includes(post.id)
        ? [...new Set([...post.likedBy, currentUserId])]
        : post.likedBy.filter((id: string) => id !== currentUserId),
      unlikedBy: unlikedPosts.includes(post.id)
        ? [...new Set([...post.unlikedBy, currentUserId])]
        : post.unlikedBy.filter((id: string) => id !== currentUserId),
    }));

    setPosts(enrichedPosts);
  } catch (e) {
    console.log("Error fetching posts:", e);
  } finally {
    setLoading(false);
  }
};


  React.useEffect(() => {
    let fetchingPosts = async () => {
      try {
        fetchPosts();
        await AsyncStorage.getItem("@userId").then((id: any) => {
          if (id) setCurrentUserId(id);
        });
      } catch (e) {
        console.log(e);
      }
    };
    fetchingPosts();
  }, []);

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

  //toogle like and unlike.
const toggleReaction = async (postId: string, action: "like" | "unlike") => {
  try {
    const likedKey = "@likedPosts";
    const unlikedKey = "@unlikedPosts";

    const likedData = await AsyncStorage.getItem(likedKey);
    const unlikedData = await AsyncStorage.getItem(unlikedKey);

    let likedPosts = likedData ? JSON.parse(likedData) : [];
    let unlikedPosts = unlikedData ? JSON.parse(unlikedData) : [];

    const hasLiked = likedPosts.includes(postId);
    const hasUnliked = unlikedPosts.includes(postId);

    // Update AsyncStorage
    if (action === "like") {
      if (hasLiked) {
        likedPosts = likedPosts.filter((id: string) => id !== postId);
      } else {
        likedPosts.push(postId);
        if (hasUnliked) {
          unlikedPosts = unlikedPosts.filter((id: string) => id !== postId);
        }
      }
    } else {
      if (hasUnliked) {
        unlikedPosts = unlikedPosts.filter((id: string) => id !== postId);
      } else {
        unlikedPosts.push(postId);
        if (hasLiked) {
          likedPosts = likedPosts.filter((id: string) => id !== postId);
        }
      }
    }

    await AsyncStorage.setItem(likedKey, JSON.stringify(likedPosts));
    await AsyncStorage.setItem(unlikedKey, JSON.stringify(unlikedPosts));

    // Update local UI state
    setPosts((prevPosts: any) =>
      prevPosts.map((post: any) =>
        post.id === postId
          ? {
              ...post,
              likedBy: likedPosts.includes(postId)
                ? [...new Set([...post.likedBy, currentUserId])]
                : post.likedBy.filter((id: string) => id !== currentUserId),
              unlikedBy: unlikedPosts.includes(postId)
                ? [...new Set([...post.unlikedBy, currentUserId])]
                : post.unlikedBy.filter((id: string) => id !== currentUserId),
              likes: likedPosts.includes(postId)
                ? post.likes + (hasLiked ? -1 : 1)
                : post.likes - (hasLiked ? 1 : 0),
              unlikes: unlikedPosts.includes(postId)
                ? post.unlikes + (hasUnliked ? -1 : 1)
                : post.unlikes - (hasUnliked ? 1 : 0),
            }
          : post
      )
    );

    // Sync with backend
    await fetch(`${POST_URL}/${postId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });
  } catch (err) {
    console.error(`Error toggling ${action}:`, err);
  }
};

  if (!loaded && !error) {
    return null;
  }

  let renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.userRow}>
        <Image
          source={
            item.user.avatar
              ? { uri: item.user.avatar }
              : require("../assets/Default Avatar.jpg")
          }
          style={[styles.avatar, { height: 40, width: 40 }]}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.timeStamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.postSection}>
        <Text style={styles.postText}>{item.content}</Text>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            resizeMode={"cover"}
            style={styles.postImage}
          />
        ) : null}
      </View>
      <View style={styles.counter}>
        <View style={{ flexDirection: "row", gap: "20%" }}>
          <Text style={styles.counterText}>{item.likes} Likes</Text>
          <Text style={styles.counterText}>{item.unlikes} Unlikes</Text>
        </View>
        <Text style={styles.counterText}>{item.comments.length} comments</Text>
      </View>
      <View style={styles.Button}>
        <View style={{ flexDirection: "row", gap: "25%" }}>
          <Pressable onPress={() => toggleReaction(item.id, "like")}>
            <MaterialCommunityIcons
              name={
                item.likedBy.includes(currentUserId)
                  ? "thumb-up"
                  : "thumb-up-outline"
              }
              size={30}
              color={"#4F46E5"}
            />
          </Pressable>
          <Pressable onPress={() => toggleReaction(item.id, "unlike")}>
            <MaterialCommunityIcons
              name={
                item.unlikedBy.includes(currentUserId)
                  ? "thumb-down"
                  : "thumb-down-outline"
              }
              size={30}
              color={"#4F46E5"}
            />
          </Pressable>
        </View>
        <Pressable>
          <MaterialCommunityIcons
            name={"comment-text"}
            size={30}
            color={"#4F46E5"}
          />
        </Pressable>
      </View>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator
        size={"large"}
        color={"#4F46E5"}
        style={{ marginTop: 100 }}
      />
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
  borderLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  card: {
    borderBottomWidth: 5,
    borderColor: "#D9D9D9",
  },
  userRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  userInfo: {
    left: "2%",
    top: "10%",
  },
  userName: {
    fontFamily: "PoppinsMedium",
    fontSize: 15,
  },
  timeStamp: {
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    top: -3,
  },
  postSection: {},
  postText: {
    fontFamily: "PoppinsRegular",
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingTop: 20,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1.5,
    //borderRadius: 8,
    marginTop: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  counter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  counterText: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
  },
  Button: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
