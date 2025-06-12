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

SplashScreen.preventAutoHideAsync();

const ForgetPasswordScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });
  const [isButtonPressed, setButtonPressed] = React.useState(false);

  //Input Validation Schema.
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid Email Address")
      .required("Email is Required"),
  });

  //MOCK_API_URL
  const MOCK_API_URL =
    "https://68482065ec44b9f3493fba2f.mockapi.io/api/v1/users";

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  //Email verification function
  let handleVerification = async (email: string) => {
    try {
      const response = await fetch(MOCK_API_URL);

      const users = await response.json();

      let userFound = users.find((user: any) => user.email === email);

      if (userFound) {
        navigation.navigate("ResetPasswordScreen", { userId: userFound.id });
        setButtonPressed(false);
        console.log(userFound.id)
      } else {
        Alert.alert("Sorry there is no account registered on this email.");
        setButtonPressed(false);
      }
    } catch (e) {
      console.log("An error occurred while verification.");
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
            <Text style={styles.guidanceText}>Forget your</Text>
            <Text style={styles.guidanceText}>Password?</Text>
          </View>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleVerification(values.email);
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
                <Pressable
                  style={[
                    styles.verifyButton,
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
                    <Text style={styles.verifyButtonText}>Verify</Text>
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

export default ForgetPasswordScreen;

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
    gap: 10,
    letterSpacing: 6,
    textAlign: "center",
  },
  TextArea: {
    paddingTop: "22%",
    justifyContent: "center",
    paddingBottom: "18%",
  },
  guidanceText: {
    fontSize: 30,
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
  },
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: 12,
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
  verifyButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: 10,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    top: "10%",
  },
  verifyButtonText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
});
