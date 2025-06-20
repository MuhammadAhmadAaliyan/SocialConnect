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
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                        fontSize: 18,
                        fontFamily: "PoppinsRegular",
                        textAlignVertical: "center",
                        height: 45,
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
                      size={20}
                      style={{ paddingLeft: 5, color: "#4F46E5" }}
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
                    <ActivityIndicator color={"#ffffff"} size={28} />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </Pressable>
              </>
            )}
          </Formik>
          <View style={styles.signup}>
            <Text style={{ fontSize: 18, fontFamily: "PoppinsRegular" }}>
              Doesn't have an account?
            </Text>
            <Pressable onPress={() => navigation.navigate("SignupScreen")}>
              <Text
                style={{
                  fontSize: 18,
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
    padding: "6%",
  },
  logo: {
    paddingTop: "24%",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "DancingScriptBold",
    fontSize: 42,
    letterSpacing: 6,
    textAlign: "center",
  },
  welcomeArea: {
    paddingTop: "22%",
    justifyContent: "center",
  },
  welcome: {
    fontSize: 30,
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
  },
  loginText: {
    fontSize: 20,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
    paddingVertical: "6%",
    paddingBottom: "12%",
  },
  inputContainer: {
    marginBottom: "10%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: 45,
    padding: 8,
    fontSize: 18,
    borderRadius: 12,
    fontFamily: "PoppinsRegular",
    alignItems: "center",
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    height: 45,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },
  forgetButton: {
    paddingVertical: 16,
  },
  forgetText: {
    fontSize: 16,
    fontFamily: "PoppinsRegular",
    textAlign: "center",
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: 10,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    top: "10%",
  },
  loginButtonText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
  signup: {
    top: "14%",
    flexDirection: "row",
    justifyContent: "center",
  },
  incorrectCrendentials: {
    fontSize: 18,
    fontFamily: "PoppinsMedium",
    color: "red",
    textAlign: "center",
    paddingBottom: 8,
  },
});
