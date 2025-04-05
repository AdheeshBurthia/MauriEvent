import { useState, useContext } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "react-native-paper";

import { AuthContext } from "../context/AuthContext";
import { auth } from "../config/firebase";
import Colours from "../constants/Colours";
import AuthHeader from "../components/AuthHeader";
import ButtonGradient from "../components/ButtonGradient";
import ErrorMessage from "../components/ErrorMessage";
import FontFamily from "../constants/Fonts";
import LoginForm from "../components/LoginForm";
import ModalFailed from "../components/ModalFailed";
import { Keyboard } from "react-native";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { authenticate, getUserData } = useContext(AuthContext);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loginHandler = async () => {
    setError(""); // Reset error message
    setEmailError(false);
    setPasswordError(false);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      if (!trimmedEmail) setEmailError(true);
      if (!trimmedPassword) setPasswordError(true);
      setError("Please fill in all the fields above.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError(true);
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const token = response._tokenResponse.idToken;
      const emailVerified = response.user?.emailVerified;
      const userId = response.user.uid;
      if (!emailVerified) {
        // alert that email has been sent
        setIsModalVisible(true);
        return;
      }
      await getUserData(userId);
      authenticate(token, emailVerified, userId);
    } catch (error) {
      console.log("Sign in error: ", error);
      setEmailError(true);
      setPasswordError(true);
      switch (error.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password!");
          break;
        case "auth/too-many-requests":
          setError(
            "Too many attempts! Try again later or reset your password."
          );
          break;
        case "auth/user-disabled":
          setError("Your account has been disabled!");
          break;
        default:
          setError("An error occurred. Please try again later!");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader title="Login to Your Account" />
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        emailError={emailError}
        passwordError={passwordError}
      />

      {/* <Button onPress={() => setIsModalVisible(true)}>Show Modal</Button> */}

      {error ? <ErrorMessage error={error} /> : null}

      <View style={styles.buttonContainer}>
        <ButtonGradient
          authHandler={loginHandler}
          loading={loading}
          text="Log in"
        />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("ForgotPassword");
            setEmail("");
            setPassword("");
            setError("");
            setEmailError(false);
            setPasswordError(false);
          }}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPassword}>Forgot the Passsword?</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.alreadyText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Signup");
              setEmail("");
              setPassword("");
              setError("");
              setEmailError(false);
              setPasswordError(false);
            }}
            style={styles.signupButton}
          >
            <Text style={styles.signup}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ModalFailed
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        title="Oops, Failed!"
        message="A verification link has been sent to your email address. Please verify your email to log in."
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  alreadyText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
    marginHorizontal: 60,
  },
  forgotPassword: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: Colours.primary,
  },
  signupButton: {
    paddingVertical: 5,
  },
  signup: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: Colours.primary,
  },
});
