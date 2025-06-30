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
import {
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

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

      if(!response.ok){
        Alert.alert("Error", "Please check your internet connection.");
        return;
      }

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
      setButtonPressed(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={"handled"}>
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
                <View style={{ marginBottom: hp(5) }}>
                  <View style={styles.passwordInput}>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: rf(2.2),
                        fontFamily: "PoppinsRegular",
                        textAlignVertical: "center",
                        height: hp(6.62),
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
                <View>
                  <View style={styles.passwordInput}>
                    <TextInput
                      style={{
                        flex: 1,
                        fontSize: rf(2.2),
                        fontFamily: "PoppinsRegular",
                        textAlignVertical: "center",
                        height: hp(6.62),
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
                      size={rf(2.4)}
                      style={{ paddingLeft: hp(0.66), color: "#4F46E5" }}
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
                    <ActivityIndicator color={"#ffffff"} size={rf(3.5)} />
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
  TextArea: {
    paddingTop: hp(11),
    justifyContent: "center",
  },
  guidanceText: {
    fontSize: rf(3.8),
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
    paddingBottom: hp(9)
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
  doneButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: hp(1.32),
    height: hp(6.62),
    borderRadius: hp(1.59),
    justifyContent: "center",
    top: hp(5),
  },
  doneButtonText: {
    fontSize: rf(2.8),
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
});
