import React, { useState, useContext } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { Button } from "react-native-paper";

import { AuthContext } from "../context/AuthContext";
import { auth } from "../config/firebase";
import Colours from "../constants/Colours";
import AuthHeader from "../components/AuthHeader";
import ErrorMessage from "../components/ErrorMessage";
import ButtonGradient from "../components/ButtonGradient";
import SignupForm from "../components/SignupForm";
import ModalSuccess from "../components/ModalSuccess";

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { addUser } = useContext(AuthContext);

  const validateUsername = (username) => {
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    setError("");
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) return false;

    const usernameRegex = /^[A-Za-z]+(?:[ _-][A-Za-z]+)*$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameError(true);
      setError("Username must contain only letters.");
      return true;
    }
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      setUsernameError(true);
      return true;
    }
    if (trimmedUsername.length > 10) {
      setUsernameError(true);
      setError("Username must be at most 10 characters long.");
      return true;
    }
    return false;
  };

  const validateEmail = (email) => {
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    setError("");
    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError(true);
      setError("Please enter a valid email address.");
      return true;
    }
    return false;
  };

  const validatePassword = (password) => {
    setError("");
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    const trimmedPassword = password.trim();

    if (trimmedPassword.length === 0) return false;

    let errors = [];
    let requirementMessage = "Password must include the following:\n";

    // Define regular expressions for each requirement
    const numberRegex = /\d/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const specialCharacterRegex = /[@$!%*?&./]/;

    // Check each requirement individually
    if (trimmedPassword.length < 6) {
      errors.push("- 6 characters long.");
    }
    if (!numberRegex.test(trimmedPassword)) {
      errors.push("- one number.");
    }
    if (!uppercaseRegex.test(trimmedPassword)) {
      errors.push("- one uppercase letter.");
    }
    if (!lowercaseRegex.test(trimmedPassword)) {
      errors.push("- one lowercase letter.");
    }
    if (!specialCharacterRegex.test(trimmedPassword)) {
      errors.push("- one special character.");
    }

    if (errors.length > 0) {
      setPasswordError(true);
      setError(requirementMessage + errors.join("\n"));
      return true; // Return true if there are errors
    } else {
      setError(""); // Clear error message if there are no errors
      return false; // Return false if there are no errors
    }
  };

  const updateUserProfile = () => {
    updateProfile(auth.currentUser, {
      displayName: username,
    })
      .then(() => {
        console.log("Profile updated");
      })
      .catch((error) => {
        console.log("Error updating profile:", error);
      });
  };

  const sendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser)
      .then(() => {
        console.log("Verification email sent");
      })
      .catch((error) => {
        console.log("Error sending verification email:", error);
      });
  };

  const signupHandler = async () => {
    setError("");
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Check if any field is empty
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      if (!trimmedUsername) setUsernameError(true);
      if (!trimmedEmail) setEmailError(true);
      if (!trimmedPassword) setPasswordError(true);
      setError("Please fill in all the fields above.");
      return;
    }

    // Validate each input
    const usernameError = validateUsername(trimmedUsername);
    const emailError = validateEmail(trimmedEmail);
    const passwordError = validatePassword(trimmedPassword);

    // Set errors if validation fails
    if (usernameError || emailError || passwordError) {
      if (usernameError) setUsernameError(true);
      if (emailError) setEmailError(true);
      if (passwordError) setPasswordError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      const id = response.user.uid;

      // update user profile with username
      updateUserProfile();

      // add user to database
      addUser(id, trimmedUsername, trimmedEmail);

      // send verification email to user
      sendVerificationEmail();

      // alert that email has been sent
      setModalVisible(true);
    } catch (error) {
      console.log("Sign up error: ", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("The email address is already in use.");
          setEmailError(true);
          break;
        default:
          setError("An error occurred. Please try again later.");
          setUsernameError(true);
          setEmailError(true);
          setPasswordError(true);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader title="Create New Account" />
      <SignupForm
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        usernameError={usernameError}
        emailError={emailError}
        passwordError={passwordError}
        validateUsername={validateUsername}
        validateEmail={validateEmail}
        validatePassword={validatePassword}
      />

      {/* <Button onPress={() => setModalVisible(true)}>Show Sucess</Button> */}

      {error ? <ErrorMessage error={error} /> : null}

      <View style={styles.signupContainer}>
        <ButtonGradient
          authHandler={signupHandler}
          loading={loading}
          text="Sign up"
        />
        <View style={styles.loginContainer}>
          <Text style={styles.alreadyText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Login");
              setUsername("");
              setEmail("");
              setPassword("");
              setError("");
              setUsernameError(false);
              setEmailError(false);
              setPasswordError(false);
            }}
            style={styles.loginButton}
          >
            <Text style={styles.login}>Log in</Text>
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
        message="A verification link has been sent to your email address. Please verify your email to log in."
      />
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
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
  alreadyText: {
    fontSize: 14,
    fontFamily: "Raleway_500Medium",
    color: Colours.extraLightText,
  },
  loginButton: {
    paddingVertical: 5,
  },
  login: {
    fontSize: 14,
    fontFamily: "Raleway_700Bold",
    color: Colours.primary,
  },
  errorContainer: {
    marginLeft: 20,
    flexDirection: "row",
  },
  errorText: {
    color: "red",
    marginLeft: 10,
  },
  loader: {
    marginTop: 20,
  },
});
