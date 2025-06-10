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
  ScrollView
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Formik } from "formik";
import * as Yup from "yup";

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
          .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Invalid Email Address"
    )
      .required("Email is Required"),
    name: Yup.string().required("Name is Required"),
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

//Button handle funtion.
let handleButton = (uName: string, uEmail: string) => {
  navigation.navigate('PasswordSetupScreen', {
    name: uName,
    email: uEmail
  });
  console.log(`Email: ${uEmail}  Name: ${uName}`);
}

  if (!loaded && !error) {
    return null;
  }

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
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder={"Name"}
                    keyboardType={"default"}
                    style={styles.input}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}
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
            <Text style={{ fontSize: 18, fontFamily: "PoppinsRegular" }}>
              Already have a account?
            </Text>
            <Pressable onPress={() => navigation.reset({
              index: 0,
              routes: [{name: 'LoginScreen'}]
            })}>
              <Text
                style={{
                  fontSize: 18,
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
  aboutText: {
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
  error: {
    color: "red",
    fontFamily: "PoppinsRegular",
    fontSize: 12,
  },
  nextButton: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#4F46E5",
    padding: 10,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    top: "10%",
  },
  nextButtonText: {
    fontSize: 22,
    fontFamily: "PoppinsBold",
    textAlign: "center",
    letterSpacing: 4,
    color: "#ffffff",
  },
  login: {
    top: "14%",
    flexDirection: "row",
    justifyContent: "center",
  },
});
