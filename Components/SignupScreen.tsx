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

const SignupScreen = ({ navigation }: any) => {
  const [loaded, error] = useFonts({
    DancingScriptBold: require("../assets/fonts/DancingScript-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  //Input Validation Schema.
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email Address")
      .required("Email is Required"),
    name: Yup.string()
      .required("Name is Required")
      .max(30, "Name can't exceed 30 characters."),
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //Button handle funtion.
  let handleButton = async (uName: string, uEmail: string) => {
    try {
      navigation.navigate("PasswordSetupScreen", {
        name: uName,
        email: uEmail,
      });
      console.log(`Email: ${uEmail}  Name: ${uName}`);
    } catch (e) {
      console.log("An occurred while saving name");
      console.log(e);
    }
  };

  if (!loaded && !error) {
    return null;
  }

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
          <View style={styles.welcomeArea}>
            <Text style={styles.welcome}>Welcome Onboard</Text>
            <Text style={styles.aboutText}>Help us get to know you</Text>
          </View>
          <Formik
            initialValues={{ email: "", name: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleButton(values.name, values.email);
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
                    placeholder={"Name"}
                    keyboardType={"default"}
                    style={styles.input}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                    maxLength={30}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.inputLength}>
                      {values.name?.length}/30
                    </Text>
                    {touched.name && errors.name && (
                      <Text style={styles.error}>{errors.name}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder={"email"}
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
                  style={styles.nextButton}
                  onPress={() => handleSubmit()}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </Pressable>
              </>
            )}
          </Formik>
          <View style={styles.login}>
            <Text style={{ fontSize: hp(2.2), fontFamily: "PoppinsRegular" }}>
              Already have a account?
            </Text>
            <Pressable
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "LoginScreen" }],
                })
              }
            >
              <Text
                style={{
                  fontSize: hp(2.2),
                  fontFamily: "PoppinsBold",
                  color: "#4F46E5",
                }}
              >
                Log In
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

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
  aboutText: {
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
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: rf(1.5),
  },
    inputLength: {
    position: "absolute",
    left: hp(36),
    fontFamily: "PoppinsRegular",
  },
  nextButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: hp(1.32),
    height: hp(6.62),
    borderRadius: hp(1.59),
    justifyContent: "center",
    top: hp(5),
  },
  nextButtonText: {
    fontSize: rf(2.8),
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
  login: {
    top: hp(7),
    flexDirection: "row",
    justifyContent: "center",
  },
});
