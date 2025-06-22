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
import { usePosts} from '../contexts/PostsContext'

const HomeScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [profileImage, setProfileImage] = React.useState<string>();
  const [loading, setLoading] = React.useState(true);
  const {posts, setPosts, likePost, unlikePost} = usePosts();
  const [userId, setUserId] = React.useState<string | null>(null);

  //MOCK_API_POST_URL
  const MOCK_API_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/posts";

  //MOCK_API_USER_URL;
  const MOCK_API_USER_URL = "https://socialconnect-backend-production.up.railway.app/users";  

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
      fetch(MOCK_API_USER_URL)
    ])
    if(!postResponse.ok || !userResponse.ok){
      console.log("An error occur while fetching!!");
      return;
    }

    
      const posts = await postResponse.json();
      const users = await userResponse.json();

      const mergedResponse = posts.map((post: any) => {
        const user = users.find((u: any) => u.id == post.userId);
        return{
          ...post,
          user: user || {}
        };
      })
       .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setPosts(mergedResponse);
      const userId = await AsyncStorage.getItem('@userId');
      if(userId) setUserId(userId);
      console.log(userId);
  } catch (e) {
    console.log("Error fetching posts:", e);
  } finally {
    setLoading(false);
  }
};

React.useEffect(() => {
  fetchPosts();
}, [])

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
    <View style={styles.card}>
      <View style={styles.userRow}>
        <Pressable onPress={() => {
          console.log(item.user.id);
          navigation.navigate("UserInfoScreen", {userId: item.user.id});
          }}>
        <Image
          source={
            item.user.avatar
              ? { uri: item.user.avatar }
              : require("../assets/Default Avatar.jpg")
          }
          style={[styles.avatar, { height: 40, width: 40 }]}
        />
        </Pressable>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.timeStamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.postSection}>
        <Text style={styles.postText}>{item.text}</Text>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            resizeMode={"cover"}
            style={styles.postImage}
          />
        ) : null}
      </View>
      <View style={styles.counter}>
        <View style={{ flexDirection: "row", gap: "20%" }}>
          <Text style={styles.counterText}>{item.likedBy.length} Likes</Text>
          <Text style={styles.counterText}>{item.unlikedBy.length} Unlikes</Text>
        </View>
        <Text style={styles.counterText}>{item.comments.length} comments</Text>
      </View>
      <View style={styles.Button}>
        <View style={{ flexDirection: "row", gap: "25%" }}>
          <Pressable onPress={() => {
            likePost(item.id, userId);
            }}>
            <MaterialCommunityIcons
              name={item.likedBy.includes(userId)? "thumb-up": "thumb-up-outline"}
              size={30}
              color={"#4F46E5"}
            />
          </Pressable>
          <Pressable onPress={() => unlikePost(item.id, userId)}>
            <MaterialCommunityIcons
              name={item.unlikedBy.includes(userId)? "thumb-down": "thumb-down-outline"}
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
