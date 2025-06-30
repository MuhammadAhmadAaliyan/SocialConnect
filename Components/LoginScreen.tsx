import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from "react-native-responsive-dimensions";

SplashScreen.preventAutoHideAsync();

const LoginScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [isButtonPressed, setButtonPressed] = React.useState(false);
  const [incorrectUserCredentials, setIncorrectUserCredentials] =
    React.useState("");
  const auth = useAuth();

  //MOCK_API_URL
  const MOCK_API_AUTH_URL =
    "https://socialconnect-backend-production.up.railway.app/login";

  //Input Validation Schema.
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid Email Address")
      .required("Email is Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is Required"),
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  //Handle Login Function
  let handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(MOCK_API_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if(!response.ok){
        Alert.alert("Error", "Please check your internet connection.");
        return;
      }

      if (response.status == 401) {
        setIncorrectUserCredentials("Incorrect email or password.");
        setButtonPressed(false);
      } else if (response.status == 200) {
        setButtonPressed(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Tabs" }],
        });

        const data = await response.json();

        auth.login(data);
        console.log(data);

        await AsyncStorage.setItem("@userLoggedIn", "true");
      } else {
        console.log(response.status);
        setButtonPressed(false);
      }
    } catch (e) {
      console.log("Login Error.");
      console.log(e);
      setButtonPressed(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SafeAreaView style={styles.container}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Social Connect</Text>
          </View>
          <View style={styles.welcomeArea}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.loginText}>Login to Continue</Text>
          </View>
          <Text style={styles.incorrectCrendentials}>
            {incorrectUserCredentials}
          </Text>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleLogin(values.email, values.password);
              setButtonPressed(true);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder={"Email"}
                    keyboardType={"email-address"}
                    style={styles.input}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}
                </View>
                <View>
                  <View style={styles.passwordInput}>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: rf(2.2),
                        fontFamily: "PoppinsRegular",
                        textAlignVertical: "center",
                        height: hp(5.96),
                      }}
                      keyboardType={"default"}
                      placeholder={"Password"}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                      secureTextEntry={!isPasswordVisible}
                    />
                    <Ionicons
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={rf(2.4)}
                      style={{ paddingLeft: hp(0.66), color: "#4F46E5" }}
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                    />
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.forgetButton}
                  onPress={() => navigation.navigate("ForgetPasswordScreen")}
                >
                  <Text style={styles.forgetText}>Forget Password?</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.loginButton,
                    isButtonPressed && {
                      borderColor: "#CCCCCC",
                      backgroundColor: "#CCCCCC",
                    },
                  ]}
                  onPress={() => {
                    handleSubmit();
                  }}
                  disabled={isButtonPressed}
                >
                  {isButtonPressed ? (
                    <ActivityIndicator color={"#ffffff"} size={rf(3.5)} />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </Pressable>
              </>
            )}
          </Formik>
          <View style={styles.signup}>
            <Text style={{ fontSize: rf(2.2), fontFamily: "PoppinsRegular" }}>
              Doesn't have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate("SignupScreen")}>
              <Text
                style={{
                  fontSize: rf(2.2),
                  fontFamily: "PoppinsBold",
                  color: "#4F46E5",
                }}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp(3),
  },
  logo: {
    paddingTop: hp(12),
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "DancingScriptBold",
    fontSize: rf(5.2),
    letterSpacing: 6,
    textAlign: "center",
  },
  welcomeArea: {
    paddingTop: hp(8),
    justifyContent: "center",
  },
  welcome: {
    fontSize: rf(3.8),
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
  },
  loginText: {
    fontSize: rf(2.5),
    fontFamily: "PoppinsRegular",
    textAlign: "center",
    paddingVertical: hp(3),
    paddingBottom: hp(6),
  },
  inputContainer: {
    marginBottom: hp(5),
  },
  input: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: hp(5.96),
    padding: hp(1.06),
    fontSize: rf(2.2),
    borderRadius: hp(1.6),
    fontFamily: "PoppinsRegular",
    alignItems: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: hp(5.96),
    borderRadius: hp(1.6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: hp(1.06),
  },
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: rf(1.5),
  },
  forgetButton: {
    paddingVertical: hp(2.12),
  },
  forgetText: {
    fontSize: rf(2),
    fontFamily: "PoppinsRegular",
    textAlign: "center",
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: hp(1.32),
    height: hp(6.62),
    borderRadius: hp(1.59),
    justifyContent: "center",
    top: hp(5),
  },
  loginButtonText: {
    fontSize: rf(2.8),
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
  signup: {
    top: hp(7),
    flexDirection: "row",
    justifyContent: "center",
  },
  incorrectCrendentials: {
    fontSize: rf(2.2),
    fontFamily: "PoppinsMedium",
    color: "red",
    textAlign: "center",
    paddingBottom: hp(1.06),
  },
});
