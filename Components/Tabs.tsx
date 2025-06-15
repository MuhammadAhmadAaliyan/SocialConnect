import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable } from "react-native";

//Importing Screens
import HomeScreen from "./HomeScreen";
import SettingScreen from "./SettingScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const Tabs = () => {
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
          return <Ionicons name={iconName} size={size} color={'#4F46E5'}/>
        },
        headerShown: false,
        tabBarShowLabel: false,
         tabBarButton: (props: any) => <Pressable {...props} android_ripple={null} />
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="SettingScreen" component={SettingScreen} />
    </Tab.Navigator>
  );
};

export default Tabs;
