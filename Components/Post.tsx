import * as React from "react";
import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import Swiper from "react-native-swiper";

//Calculate Image dimension
const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = (screenWidth * 5) / 4;

const Post = ({ item, userId, navigation, likePost, unlikePost }: any) => {
  const likeAnimeRef = React.useRef<LottieView>(null);
  const isLiked = item.likedBy.includes(userId);
  const isUnliked = item.unlikedBy.includes(userId);
  const [showAnimation, setShowAnimation] = React.useState(false);

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

  return (

    <View style={styles.card}>
      <View style={styles.userRow}>
        <Pressable
          onPress={() => {
            console.log(item.user.id);
            navigation.navigate("UserInfoScreen", { userId: item.user.id });
          }}
        >
          <Image
            source={
              item.user.avatar
                ? { uri: item.user.avatar }
                : require("../assets/Default Avatar.jpg")
            }
            style={[styles.avatar, { height: wp(11.11), width: hp(5.29) }]}
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
<View>
  {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

  {Array.isArray(item.images) && item.images.length > 0 ? (
    <Swiper
      loop={false}
      dotColor="#ccc"
      activeDotColor="#4F46E5"
      style={{ height: imageHeight + hp(6.62) }}
    >
      {item.images.map((uri: any, index: any) => (
        <View key={index} style={{ alignItems: "center", justifyContent: "center" }}>
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
             <View style={{ width: wp(13.89), height: hp(4.23), justifyContent: "center", alignItems: "center" }}>
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
  );
};

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
});
