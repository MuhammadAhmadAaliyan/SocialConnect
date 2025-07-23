import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./contexts/AuthContext";
import { PostProvider } from "./contexts/PostsContext";
import { ProfileImageProvider } from "./contexts/ProfileImageContext";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

//Importing Screens.
import LoginScreen from "./Components/LoginScreen";
import SignupScreen from "./Components/SignupScreen";
import PasswordSetupScreen from "./Components/PasswordSetupScreen";
import ForgetPasswordScreen from "./Components/ForgetPasswordScreen";
import ResetPasswordScreen from "./Components/ResetPasswordScreen";
import Tabs from "./Components/Tabs";
import ProfileScreen from "./Components/ProfileScreen";
import CreatePostScreen from "./Components/CreatePostScreen";
import UserInfoScreen from "./Components/UserInfoScreen";
import CommentsScreen from "./Components/CommentsScreen";
import EditPostScreen from "./Components/EditPostScreen";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("./assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("./assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
  });
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    const prepareApp = async () => {
      try {
        const value = await AsyncStorage.getItem("@userLoggedIn");
        setIsLoggedIn(value === "true");
      } catch (e) {
        console.warn("Failed to load login status");
      } finally {
        setIsAppReady(true);
      }
    };
    prepareApp();
  }, []);


  const onLayoutRootView = React.useCallback(async () => {
    if ((isAppReady && loaded) || error) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady, loaded, error]);

  if (!isAppReady || !loaded) return null;

  return (
    <SafeAreaProvider>
        <ProfileImageProvider>
    <AuthProvider>
      <PostProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={isLoggedIn ? "Tabs" : "LoginScreen"}
            >
              {/* Always include all screens */}
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="SignupScreen" component={SignupScreen} />
              <Stack.Screen
                name="PasswordSetupScreen"
                component={PasswordSetupScreen}
              />
              <Stack.Screen
                name="ForgetPasswordScreen"
                component={ForgetPasswordScreen}
              />
              <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPasswordScreen}
              />
              <Stack.Screen name="Tabs" component={Tabs} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
              <Stack.Screen
                name="CreatePostScreen"
                component={CreatePostScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Create new Post",
                  headerTitleStyle: { fontFamily: "PoppinsMedium" },
                }}
              />
              <Stack.Screen
                name="UserInfoScreen"
                component={UserInfoScreen}
                options={{
                  headerShown: true,
                  title:"",
                  headerTitleStyle: { fontFamily: "PoppinsMedium" },
                }}
              />
              <Stack.Screen
                name="CommentsScreen"
                component={CommentsScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Comments",
                  headerTitleStyle: { fontFamily: "PoppinsMedium" },
                }}
              />
              <Stack.Screen
              name="EditPostScreen"
              component={EditPostScreen}
              options={{
                headerShown: true,
                headerTitle: "Edit Post"
              }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </PostProvider>
    </AuthProvider>
        </ProfileImageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
