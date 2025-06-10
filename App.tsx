import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Importing Screens.
import LoginScreen from "./Components/LoginScreen";
import SignupScreen from "./Components/SignupScreen";
import PasswordSetupScreen from "./Components/PasswordSetupScreen";
import ForgetPasswordScreen from "./Components/ForgetPasswordScreen";
import ResetPasswordScreen from "./Components/ResetPasswordScreen";
import HomeScreen from "./Components/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="PasswordSetupScreen" component={PasswordSetupScreen} />
        <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
