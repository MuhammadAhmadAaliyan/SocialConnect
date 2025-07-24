import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Socket from "../Socket"; // your initialized socket.io client

export default function MessageScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState();
  const [profileImage, setProfileImage] = useState<any>();
  const [currentUserId, setCurrentUserId] = useState<any>();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [isMenuModalVisible, setMenuModalVisible] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const [isLoadingModalVisible, setLoadingModalVisible] = React.useState(false);

  // Fetch user & chat messages
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://socialconnect-backend-production.up.railway.app/specific-user/${userId}`,
        );
        const me = await AsyncStorage.getItem("@userId");
        console.log(me);
        console.log(userId);

        if (!res.ok) return;

        const userData = await res.json();
        setUserName(userData.name);
        setProfileImage(userData.avatar);
        setCurrentUserId(me);

        // fetch existing messages
        const msgRes = await fetch(
          `https://socialconnect-backend-production.up.railway.app/messages/${me}/${userId}`,
        );
        const chatData = await msgRes.json();
        setMessages(chatData || []);
      } catch (e) {
        console.log("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle socket incoming messages
  useEffect(() => {
    if (!currentUserId) return;

    Socket.connect();

    Socket.on("connect", () => {
      Socket.emit("joinRoom", currentUserId); // Ensure current user joins their own room
      console.log("Socket connected:", Socket.id);
    });

    Socket.on("receiveMessage", (msg) => {
      // Show only messages related to this chat
      if (
        (msg.sender === currentUserId && msg.receiver === userId) ||
        (msg.sender === userId && msg.receiver === currentUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => {
      Socket.off("receiveMessage");
      Socket.disconnect();
    };
  }, [currentUserId]);

  const handleSend = async () => {
    if (!input.trim() || !currentUserId) return;

    const msgObj = {
      senderId: currentUserId,
      receiverId: userId,
      text: input.trim(),
    };

    try {
      // Send via REST API (server will also emit it via socket)
      const res = await fetch(
        "https://socialconnect-backend-production.up.railway.app/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(msgObj),
        },
      );

      const data = await res.json();
      if (res.ok && data.data) {
        setMessages((prev) => [...prev, data.data]); // Push the confirmed message
        scrollToBottom();
      } else {
        console.log("Send error:", data.error || "Unknown error");
      }
    } catch (err) {
      console.log("Message send failed:", err);
    }

    setInput("");
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === currentUserId ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ backgroundColor: "#ffffff", flex: 1 }}>
        <ActivityIndicator
          size={"large"}
          color={"#4F46E5"}
          style={{ marginTop: hp(13.2) }}
        />
      </View>
    );
  }

  const openMenu = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setMenuModalVisible(true);
  };

  //clear chat
  const clearChat = async () => {
    try {
      setLoadingModalVisible(true); // Show the modal loader

      const response = await fetch(
        `https://socialconnect-backend-production.up.railway.app/delete-messages/${currentUserId}/${userId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setMessages([]); // Clear messages locally
        console.log("Chat cleared successfully.");
      } else {
        const errorData = await response.text(); // Try to capture error detail
        console.log("Failed to delete:", response.status, errorData);
      }
    } catch (e) {
      console.log("Error while clearing chat:", e);
    } finally {
      setLoadingModalVisible(false); // Hide the modal loader
    }
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <Ionicons
              name="arrow-back"
              size={rf(3.5)}
              style={{ paddingRight: wp(2), alignSelf: "center" }}
              onPress={() => navigation.goBack()}
            />
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <Text style={styles.userName}>{userName}</Text>
            <MaterialIcons
              name="more-vert"
              size={rf(3.5)}
              style={styles.menuIcon}
              onPress={(e) => openMenu(e)}
            />
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "#ffffff",
              paddingBottom: insets.bottom + hp(-2),
            }}
          />
        </KeyboardAvoidingView>
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
                setMenuModalVisible(false);
                clearChat();
              }}
            >
              <Text style={styles.menuText}>Clear Chat</Text>
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
            <Text style={styles.modalText}>Clearing...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: "#ffffff",
    paddingTop: hp(4),
    elevation: 3,
  },
  avatar: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(2.5),
  },
  userName: {
    marginLeft: wp(2.5),
    fontSize: rf(2),
    fontWeight: "bold",
    flex: 1,
  },
  menuIcon: {
    paddingLeft: wp(2.5),
  },
  chatContainer: {
    padding: wp(3),
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    padding: wp(3),
    borderRadius: wp(3),
    marginVertical: hp(0.6),
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#c6c3f7ff",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: rf(1.9),
  },
  inputContainer: {
    flexDirection: "row",
    padding: wp(3),
    backgroundColor: "#fff",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: wp(7),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    fontSize: rf(1.9),
  },
  sendButton: {
    marginLeft: wp(2.5),
    backgroundColor: "#4F46E5",
    borderRadius: hp(5),
    padding: wp(3),
  },
  overlay: {
    flex: 1,
    justifyContent: "space-around",
  },
  menu: {
    backgroundColor: "#ffffff",
    padding: hp(1),
    borderColor: "#E0E0E0",
    borderRadius: hp(1.6),
    borderWidth: 1,
    width: wp(32),
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
