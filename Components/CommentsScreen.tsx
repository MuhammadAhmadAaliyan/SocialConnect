import * as React from "react";
import {
  SafeAreaView,
  Text,
  Pressable,
  StyleSheet,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePosts } from "../contexts/PostsContext";

const CommentsScreen = () => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [currentUserId, setCurrentUserId] = React.useState<any>();
  const [userComment, setUserComment] = React.useState<string>();
  const [comments, setComments] = React.useState<any>();
  const [loading, setLoading] = React.useState(true);

  const route = useRoute();
  const posts = usePosts();

  const { postId, onCommentAdded } = route.params as { postId: string, onCommentAdded: any};
  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  //MOCK_API_POST_URL
  const MOCK_API_POST_URL =
    "https://socialconnect-backend-production.up.railway.app/posts";

  //MOCK_API_USER_URL;
  const MOCK_API_USER_URL =
    "https://socialconnect-backend-production.up.railway.app/users";

  //MOCK_API_COMMENT_URL;
  const MOCK_API_COMMENT_URL =
    "https://socialconnect-backend-production.up.railway.app/comment";

  const fetchComments = async () => {
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

      const post = posts.find((p: any) => p.id === postId);

      const comments = post.comments;

      const mergedResponse = comments
        .map((comment: any) => {
          const user = users.find((u: any) => u.id == comment.userId);
          return {
            ...comment,
            user: user || {},
          };
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

      setComments(mergedResponse);
      const currUserId = await AsyncStorage.getItem("@userId");
      if (currUserId) setCurrentUserId(currUserId);
      console.log(currUserId);
    } catch (e) {
      console.log("Error fetching posts:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchComments();
  }, []);

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  let renderItem = ({ item }: any) => (
    <View style={styles.comment}>
      {item.user.avatar ? (
        <Image
          source={{ uri: item.user.avatar }}
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
      <View>
        <Text style={styles.userName}>
          {item.user.id === currentUserId ? "You" : item.user.name}
        </Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.timeStamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <ActivityIndicator
          size={"large"}
          color={"#4F46E5"}
          style={{ marginTop: 100 }}
        />
      </View>
    );

  //Comment send function
  let sendComment = async () => {
    try {
      const userId = await AsyncStorage.getItem("@userId");
      const profileImage = await AsyncStorage.getItem("@profileImage");

      const newComment = {
        id: generateId(),
        text: userComment ?? "",
        timestamp: new Date().toISOString(),
        user: {
          name: "You",
          avatar: profileImage ?? "",
        },
      };

      setUserComment("");
      setComments((prev: any) => [newComment, ...prev]);
      posts.addComment(postId, newComment)
      console.log(postId);
      const response = await fetch(`${MOCK_API_COMMENT_URL}/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newComment.id,
          userId: userId,
          text: newComment.text,
          timestamp: newComment.timestamp
        }),
      });

      if (response.status == 201) {
        console.log("Comment created Successfully.");
      } else {
        console.log(response.status);
      }
    } catch (e) {
      console.log("Comment doesn't send.");
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={70}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.container}>
              {comments.length > 0 ? (
                <FlatList
                  data={comments}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: "PoppinsMedium",
                      color: "#D3D3D3",
                    }}
                  >
                    No Comments Yet
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.borderLine} />
            <View style={styles.userCommentContainer}>
              <TextInput
                value={userComment}
                onChangeText={(text) => setUserComment(text)}
                placeholder="Write a comment"
                style={styles.userComment}
                maxLength={60}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  !userComment?.trim() && {
                    borderColor: "#CCCCCC",
                    backgroundColor: "#CCCCCC",
                  },
                ]}
                disabled={!userComment?.trim()}
                onPress={() => sendComment()}
              >
                <MaterialCommunityIcons
                  name={"send"}
                  size={20}
                  color={"#ffffff"}
                  style={!userComment?.trim() && { opacity: 0.6 }}
                />
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CommentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  commentSection: {},
  comment: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontFamily: "PoppinsMedium",
    fontSize: 16,
  },
  commentText: {
    fontFamily: "PoppinsRegular",
    fontSize: 14,
    top: -3,
  },
  timeStamp: {
    fontFamily: "PoppinsRegular",
    fontSize: 10,
    top: -2,
  },
  userCommentContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    marginBottom: 20,
  },
  userComment: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: 40,
    width: "80%",
    padding: 8,
    fontSize: 14,
    borderRadius: 10,
    fontFamily: "PoppinsRegular",
    alignItems: "center",
  },
  sendButton: {
    position: "absolute",
    right: "0%",
    width: "16%",
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    height: 40,
    padding: 8,
    fontSize: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  borderLine: {
    height: 0.5,
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 0.5,
    elevation: 0.5,
    marginBottom: 20,
  },
});
