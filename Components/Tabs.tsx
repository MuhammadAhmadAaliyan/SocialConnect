import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  responsiveScreenWidth as wp,
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

//Importing Screens
import HomeScreen from "./HomeScreen";
import SettingScreen from "./SettingScreen";


const Tab = createBottomTabNavigator();

function CustomTabBarButton({ children }: any) {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate("CreatePostScreen" as never)}
      style={styles.buttonWrapper}
    >
      <View style={styles.plusButton}>{children}</View>
    </Pressable>
  );
}

const DummyScreen = () => null;

const Tabs = () => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName: any = "";

          if (route.name === "HomeScreen") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SettingScreen") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={rf(3.43)} color={"#4F46E5"} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props: any) => (
          <Pressable {...props} android_ripple={null} />
        ),
        tabBarStyle: {
          height: insets.bottom + hp(7.94),
          backgroundColor: "#fff",
          paddingTop: hp(1.32)
        },
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen
        name="CreatePostTab"
        component={DummyScreen}
        options={{
          tabBarIcon: () => (
            <MaterialCommunityIcons name="plus" size={rf(3.43)} color="#fff" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="SettingScreen" component={SettingScreen} options={{
        headerShown: true,
        headerTitle: "Settings",
        headerTitleStyle: {
          fontFamily: "PoppinsMedium",
        }
        }}/>
    </Tab.Navigator>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -20 }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  plusButton: {
    width: wp(11.11),
    height: hp(5.29),
    borderRadius: 30,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    top: hp(1.32)
  },
});
