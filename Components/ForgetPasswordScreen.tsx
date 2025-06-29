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
import {
  responsiveScreenHeight as hp,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';

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
  const MOCK_API_AUTH_URL =
    "https://socialconnect-backend-production.up.railway.app/user";

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
      const response = await fetch(`${MOCK_API_AUTH_URL}/${email}`);

      if (response.status == 404) {
        Alert.alert("Sorry!!", "Incorrect Email. No user found.");
        setButtonPressed(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const userIndex = data.userIndex;

        setButtonPressed(false);
        navigation.navigate("ResetPasswordScreen", { userIndex: userIndex });
        console.log(userIndex)
      } else {
        console.log(response.status);
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={"handled"}>
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
                    <ActivityIndicator color={"#ffffff"} size={rf(3.5)} />
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
    paddingBottom: hp(9)
  },
  guidanceText: {
    fontSize: rf(3.8),
    fontFamily: "PoppinsMedium",
    letterSpacing: 6,
    textAlign: "center",
  },
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: rf(1.5),
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
  verifyButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: hp(1.32),
    height: hp(6.62),
    borderRadius: hp(1.59),
    justifyContent: "center",
    top: hp(5),
  },
  verifyButtonText: {
    fontSize: rf(2.8),
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
});
