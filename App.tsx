import * as React from 'react';
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen'

//Importing Screens.
import LoginScreen from "./Components/LoginScreen";
import SignupScreen from "./Components/SignupScreen";
import PasswordSetupScreen from "./Components/PasswordSetupScreen";
import ForgetPasswordScreen from "./Components/ForgetPasswordScreen";
import ResetPasswordScreen from "./Components/ResetPasswordScreen";
import Tabs from './Components/Tabs';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {

 const [isAppReady, setIsAppReady] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const prepareApp = async () => {
      try {
        const value = await AsyncStorage.getItem('@userLoggedIn');
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
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn? (
          <Stack.Screen name="Tabs" component={Tabs} />
        ): (
          <>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="PasswordSetupScreen" component={PasswordSetupScreen} />
        <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
