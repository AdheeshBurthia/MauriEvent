import React, { useState, useRef } from "react";
import { View, TextInput, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const ForgotPasswordForm = ({ email, setEmail, emailError }) => {
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const emailLabelPosition = useRef(
    new Animated.Value(email ? -16 : 16)
  ).current;

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

  return (
    <View style={styles.form}>
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
          onChangeText={(email) => setEmail(email)}
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

export default ForgotPasswordForm;
