import { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import AuthHeader from "../components/AuthHeader";
import ButtonGradient from "../components/ButtonGradient";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import ErrorMessage from "../components/ErrorMessage";
import ModalSuccess from "../components/ModalSuccess";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { checkUser } = useContext(AuthContext);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailHandler = async () => {
    setEmailError(false);
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError(true);
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError(true);
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Check if email exists in the database
      const response = await checkUser(trimmedEmail);

      if (!response) {
        setEmailError(true);
        setError("Email does not exist!");
        return;
      }
      const reset = await sendPasswordResetEmail(auth, trimmedEmail);
      console.log(reset);
      // alert that email has been sent
      setModalVisible(true);
    } catch (error) {
      setEmailError(true);
      setError("An error occurred. Please try again later.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader title="Forgot Password" />
      <ForgotPasswordForm
        email={email}
        setEmail={setEmail}
        emailError={emailError}
      />

      {error ? <ErrorMessage error={error} /> : null}

      <View style={styles.signupContainer}>
        <ButtonGradient
          authHandler={emailHandler}
          loading={loading}
          text="Confirm"
        />
        <View style={styles.loginContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Login");
              setError("");
              setEmailError(false);
            }}
          >
            <Text style={styles.signin}>Return back to Log in?</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ModalSuccess
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          navigation.navigate("Login");
        }}
        title="Successful!"
        message="A password reset link has been sent to your email address. Please check your email to reset your password."
      />
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  input: {
    height: 55,
    fontSize: 16,
    backgroundColor: Colours.lightBackground,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingLeft: 50,
    fontFamily: FontFamily.medium,
  },
  signupContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  signin: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: Colours.primary,
  },
});
