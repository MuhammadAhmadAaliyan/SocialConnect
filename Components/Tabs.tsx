import * as React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';

//Importing Screens
import HomeScreen from "./HomeScreen";
import SettingScreen from "./SettingScreen";

const Tab = createBottomTabNavigator();

const Tabs = () => {

const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

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
        tabBarIcon: ({ focused, size }) => {
          let iconName: any = "";

          if (route.name === "HomeScreen") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SettingScreen") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={size} color={"#4F46E5"} />;
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props: any) => (
          <Pressable {...props} android_ripple={null} />
        ),
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="SettingScreen" component={SettingScreen} />
    </Tab.Navigator>
  );
};

export default Tabs;