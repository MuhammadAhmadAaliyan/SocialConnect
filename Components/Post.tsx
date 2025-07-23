import * as React from "react";
import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { usePosts } from "../contexts/PostsContext";

//Calculate Image dimension
const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = (screenWidth * 5) / 4;

const Post = React.memo(
  ({ item, userId, navigation, likePost, unlikePost }: any) => {
    const likeAnimeRef = React.useRef<LottieView>(null);
    const isLiked = item.likedBy.includes(userId);
    const isUnliked = item.unlikedBy.includes(userId);
    const [showAnimation, setShowAnimation] = React.useState(false);
    const [isMenuModalVisible, setMenuModalVisible] = React.useState(false);
    const [isLoadingModalVisible, setLoadingModalVisible] =
      React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
    const {setPosts} = usePosts();

    const MOCK_API_POST_DELETE_URL =
      "https://socialconnect-backend-production.up.railway.app/delete-post";

    const handleLike = () => {
      if (!isLiked) {
        setShowAnimation(true);
      }
      likePost(item.id, userId);
    };

    //format count
    const formatCount = (count: number): string => {
      if (count >= 1_000_000) {
        return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
      } else if (count >= 1_000) {
        return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
      } else {
        return count.toString();
      }
    };

    //Open post menu
    const openMenu = (event: any) => {
      const { pageX, pageY } = event.nativeEvent;
      setMenuPosition({ x: pageX, y: pageY });
      setMenuModalVisible(true);
    };

    //delete post
    let deletePost = () => {
      Alert.alert(
        "Confirm Deletion:",
        "Are you sure you want to delete this post?",
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
              setLoadingModalVisible(true);
              try {
                const response = await fetch(
                  `${MOCK_API_POST_DELETE_URL}/${item.id}`,
                  {
                    method: "DELETE",
                  },
                );

                if (response.status == 200) {
                  console.log("Post deleted successfully.");
                  setPosts(prev => prev.filter(p => p.id != item.id))
                  setLoadingModalVisible(false);
                } else {
                  console.log(response.status);
                  setLoadingModalVisible(false);
                }
              } catch (e) {
                console.log("Error: ", e);
              }
            },
          },
        ],
      );
    };

    return (
      <>
        <View style={styles.card}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.userRow}>
              <Pressable
                onPress={() => {
                  console.log(item.user.id);
                  navigation.navigate("UserInfoScreen", {
                    userId: item.user.id,
                  });
                }}
              >
                <Image
                  source={
                    item.user.avatar
                      ? { uri: item.user.avatar }
                      : require("../assets/Default Avatar.jpg")
                  }
                  style={[styles.avatar, { height: hp(5.29), width: hp(5.29) }]}
                />
              </Pressable>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item.user.id == userId ? "You" : item.user.name}
                </Text>
                <Text style={styles.timeStamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
            {item.user.id == userId ? (
              <Icon
                name={"more-vert"}
                size={rf(3.43)}
                style={{ paddingRight: wp(2.78), paddingTop: hp(1.32) }}
                onPress={(e) => openMenu(e)}
              />
            ) : null}
          </View>
          <View>
            {item.text ? (
              <Text style={styles.postText}>{item.text}</Text>
            ) : null}

            {Array.isArray(item?.images) && item?.images.length > 0 ? (
              <Swiper
                loop={false}
                dotColor="#ccc"
                activeDotColor="#4F46E5"
                style={{ height: imageHeight + hp(6.62) }}
              >
                {item.images.map((uri: any, index: any) => (
                  <View
                    key={index}
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Image
                      source={{ uri }}
                      resizeMode="cover"
                      style={styles.postImage}
                    />
                  </View>
                ))}
              </Swiper>
            ) : null}
          </View>
          <View style={styles.counter}>
            <View style={{ flexDirection: "row", gap: wp(14.5) }}>
              <Text style={styles.counterText}>
                {formatCount(item.likedBy.length)} Likes
              </Text>
              <Text style={styles.counterText}>
                {formatCount(item.unlikedBy.length)} Unlikes
              </Text>
            </View>
            <Text style={styles.counterText}>
              {formatCount(item.comments.length)} Comments
            </Text>
          </View>
          <View style={styles.Button}>
            <View style={{ flexDirection: "row", gap: wp(14.5) }}>
              <Pressable
                onPress={() => {
                  handleLike();
                }}
              >
                <View
                  style={{
                    width: wp(13.89),
                    height: hp(4.23),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {showAnimation ? (
                    <LottieView
                      ref={likeAnimeRef}
                      source={require("../assets/animations/thums up animation.json")}
                      autoPlay
                      loop={false}
                      onAnimationFinish={() => setShowAnimation(false)}
                      style={{ width: wp(22.22), height: hp(10.59) }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={isLiked ? "thumb-up" : "thumb-up-outline"}
                      size={rf(3.97)}
                      color={"#4F46E5"}
                    />
                  )}
                </View>
              </Pressable>
              <Pressable onPress={() => unlikePost(item.id, userId)}>
                <MaterialCommunityIcons
                  name={isUnliked ? "thumb-down" : "thumb-down-outline"}
                  size={rf(3.97)}
                  color={"#4F46E5"}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                navigation.navigate("CommentsScreen", { postId: item.id });
                console.log(item.id);
              }}
            >
              <MaterialCommunityIcons
                name={"comment-text"}
                size={rf(3.97)}
                color={"#4F46E5"}
              />
            </Pressable>
          </View>
        </View>
        <Modal
          visible={isMenuModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuModalVisible(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuModalVisible(false)}
          >
            <View
              style={[
                styles.menu,
                {
                  position: "absolute",
                  top: menuPosition.y - hp(5),
                  left: menuPosition.x - wp(28),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  navigation.push("EditPostScreen", { postId: item.id });
                  setMenuModalVisible(false);
                }}
              >
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  deletePost();
                  setMenuModalVisible(false);
                }}
              >
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
        <Modal
          visible={isLoadingModalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.modalText}>Deleting...</Text>
            </View>
          </View>
        </Modal>
      </>
    );
  },
);

export default Post;

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 5,
    borderColor: "#D9D9D9",
  },
  userRow: {
    flexDirection: "row",
    paddingVertical: hp(1.32),
    paddingHorizontal: wp(2.78),
  },
  userInfo: {
    left: wp(1),
    top: hp(0.3),
  },
  userName: {
    fontFamily: "PoppinsMedium",
    fontSize: rf(1.99),
  },
  timeStamp: {
    fontFamily: "PoppinsRegular",
    fontSize: rf(1.72),
    top: hp(-0.4),
  },
  postText: {
    fontFamily: "PoppinsRegular",
    fontSize: rf(2.38),
    paddingHorizontal: wp(2.78),
    paddingVertical: hp(1.32),
    paddingTop: hp(2.65),
  },
  postImage: {
    width: imageWidth,
    height: imageHeight,
    //borderRadius: 8,
    marginTop: hp(1.06),
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  counter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(2.78),
    paddingVertical: hp(2.65),
  },
  counterText: {
    fontSize: rf(1.85),
    fontFamily: "PoppinsRegular",
  },
  Button: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(2.78),
    paddingVertical: hp(1.32),
  },
  avatar: {
    width: wp(12.5),
    height: hp(5.96),
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderRadius: hp(3.97),
  },
  overlay: {
    flex: 1,
    justifyContent: "space-around",
  },
  menu: {
    backgroundColor: "#ffffff",
    padding: hp(1.6),
    borderColor: "#E0E0E0",
    borderRadius: hp(1.6),
    borderWidth: 1,
    width: wp(30),
  },
  menuButton: {
    paddingVertical: hp(1.6),
  },
  menuText: {
    fontSize: rf(2.6),
    fontFamily: "PoppinsRegular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
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
