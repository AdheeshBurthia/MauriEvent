import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const SignupForm = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  usernameError,
  emailError,
  passwordError,
  validateUsername,
  validateEmail,
  validatePassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const usernameLabelPosition = useRef(
    new Animated.Value(username ? -16 : 16)
  ).current;
  const emailLabelPosition = useRef(
    new Animated.Value(email ? -16 : 16)
  ).current;
  const passwordLabelPosition = useRef(
    new Animated.Value(password ? -16 : 16)
  ).current;

  const handleUsernameFocus = () => {
    setIsUsernameFocused(true);
    Animated.timing(usernameLabelPosition, {
      toValue: -16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleUsernameBlur = () => {
    if (!username) {
      setIsUsernameFocused(false);
      Animated.timing(usernameLabelPosition, {
        toValue: 16,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    Animated.timing(emailLabelPosition, {
      toValue: -16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEmailBlur = () => {
    if (!email) {
      setIsEmailFocused(false);
      Animated.timing(emailLabelPosition, {
        toValue: 16,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    Animated.timing(passwordLabelPosition, {
      toValue: -16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setIsPasswordFocused(false);
      Animated.timing(passwordLabelPosition, {
        toValue: 16,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleUsername = (username) => {
    setUsername(username);
    validateUsername(username);
  };

  const handleEmail = (email) => {
    setEmail(email);
    validateEmail(email);
  };

  const handlePassword = (password) => {
    setPassword(password);
    validatePassword(password);
  };

  return (
    <View style={styles.form}>
      <View
        style={[
          styles.inputContainer,
          isUsernameFocused && styles.inputContainerFocused,
          usernameError && styles.errorInputContainer,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            isUsernameFocused && styles.labelFocused,
            usernameError && styles.errorLabel,
            { top: usernameLabelPosition },
          ]}
        >
          Enter your Username
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={username}
          onChangeText={handleUsername}
          onFocus={handleUsernameFocus}
          onBlur={handleUsernameBlur}
        />
        <Icon
          name="user"
          size={20}
          color={
            usernameError
              ? Colours.danger
              : isUsernameFocused
              ? Colours.primary
              : Colours.iconLight
          }
          style={styles.icon}
        />
      </View>
      <View
        style={[
          styles.inputContainer,
          isEmailFocused && styles.inputContainerFocused,
          emailError && styles.errorInputContainer,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            isEmailFocused && styles.labelFocused,
            emailError && styles.errorLabel,
            { top: emailLabelPosition },
          ]}
        >
          Enter your Email
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={email}
          autoCapitalize="none"
          onChangeText={handleEmail}
          onFocus={handleEmailFocus}
          onBlur={handleEmailBlur}
        />
        <Icon
          name="envelope"
          size={20}
          color={
            emailError
              ? Colours.danger
              : isEmailFocused
              ? Colours.primary
              : Colours.iconLight
          }
          style={styles.icon}
        />
      </View>
      <View
        style={[
          styles.inputContainer,
          isPasswordFocused && styles.inputContainerFocused,
          passwordError && styles.errorInputContainer,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            isPasswordFocused && styles.labelFocused,
            passwordError && styles.errorLabel,
            { top: passwordLabelPosition },
          ]}
        >
          Enter your Password
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder=""
          secureTextEntry={!showPassword}
          value={password}
          autoCapitalize="none"
          onChangeText={handlePassword}
          onFocus={handlePasswordFocus}
          onBlur={handlePasswordBlur}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? "eye" : "eye-slash"}
            size={20}
            color={
              passwordError
                ? Colours.danger
                : isPasswordFocused
                ? Colours.primary
                : Colours.iconLight
            }
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 35,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 15,
    paddingHorizontal: 18,
    borderColor: Colours.outline,
    borderWidth: 1,
  },
  inputContainerFocused: {
    borderColor: Colours.primary,
    borderWidth: 1,
  },
  label: {
    position: "absolute",
    left: 18,
    fontSize: 16,
    color: Colours.extraLightText,
    fontFamily: FontFamily.regular,
  },
  labelFocused: {
    top: -16,
    fontSize: 12,
    color: Colours.primary,
    padding: 5,
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: Colours.mediumText,
    fontFamily: FontFamily.regular,
  },
  icon: {
    paddingVertical: 15,
  },
  errorInputContainer: {
    borderColor: Colours.danger,
    borderWidth: 1,
  },
  errorLabel: {
    color: Colours.danger,
  },
});

export default SignupForm;
