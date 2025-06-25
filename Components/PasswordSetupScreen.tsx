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
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const PasswordSetupScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] =
    React.useState(false);
  const [isButtonPressed, setButtonPressed] = React.useState(false);
  const route = useRoute();

  //Input Validation Schema.
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Password is Required"),
  });

  const generateId = () => (Date.now().toString(36) + Math.random().toString(36).substring(2));

  //MOCK_API_URL
  const MOCK_API_AUTH_URL =
    "https://socialconnect-backend-production.up.railway.app/signup";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  const { name, email } = route.params as { name: string; email: string };

  if (!loaded && !error) {
    return null;
  }

  //handle Signup function.
  let handleSignup = async (password: string) => {
    try {
      const newUser = {
        id: generateId(),
        name: name,
        email: email,
        password: password
      };
      const response = await fetch(MOCK_API_AUTH_URL,{
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      if(response.status == 400){
        Alert.alert("Alert!", "The email you entered is already registered. Please use another email.");
        setButtonPressed(false);
        return;
      }else if(response.status == 201){
        Alert.alert("Success", "Signup Successful. Please use your credentials to login.");
        setButtonPressed(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });

      }else{
        console.log("Error: ", response.status);
        setButtonPressed(false);
      }
    } catch (e) {
      console.log("Signup Error.");
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
          <View style={styles.TextArea}>
            <Text style={styles.guidanceText}>Set up a Password</Text>
          </View>
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleSignup(values.password);
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
                <View style={{ marginBottom: "10%" }}>
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
                      placeholder={"Confirm Password"}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      value={values.confirmPassword}
                      secureTextEntry={!isConfirmPasswordVisible}
                    />
                    <Ionicons
                      name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      style={{ paddingLeft: 5, color: "#4F46E5" }}
                      onPress={() =>
                        setConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    />
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                  )}
                </View>
                <Pressable
                  style={[
                    styles.doneButton,
                    isButtonPressed && {
                      borderColor: "#CCCCCC",
                      backgroundColor: "#CCCCCC",
                    },
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={isButtonPressed}
                >
                  {isButtonPressed ? (
                    <ActivityIndicator color={"#ffffff"} size={28} />
                  ) : (
                    <Text style={styles.doneButtonText}>Done</Text>
                  )}
                </Pressable>
              </>
            )}
          </Formik>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PasswordSetupScreen;

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
  TextArea: {
    paddingTop: "22%",
    justifyContent: "center",
  },
  guidanceText: {
    fontSize: 30,
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
    paddingBottom: "18%",
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
  doneButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: 10,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    top: "10%",
  },
  doneButtonText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
});
