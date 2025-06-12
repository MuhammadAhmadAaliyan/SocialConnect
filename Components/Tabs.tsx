import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

//Importing Screens
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import SettingScreen from "./SettingScreen";

const Tab = createBottomTabNavigator();

const Tabs = () => {
    return(
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen name="HomeScreen" component={HomeScreen}/>
            <Tab.Screen name="SettingScreen" component={SettingScreen}/>
            <Tab.Screen name="ProfileScreen" component={ProfileScreen}/>
        </Tab.Navigator>
    );
}

export default  Tabs;