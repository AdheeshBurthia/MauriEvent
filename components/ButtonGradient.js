import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import Colours from "../constants/Colours";

const ButtonGradient = ({ authHandler, loading, text }) => {
  if (loading) {
    // Return a disabled state for the button when loading is true
    return (
      <LinearGradient
        colors={[Colours.primary, Colours.accent1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.signinButton, styles.disabled]}
      >
        <ActivityIndicator size={30} color="white" style={styles.loader} />
      </LinearGradient>
    );
  }

  // Return the regular TouchableOpacity when loading is false
  return (
    <TouchableOpacity onPress={authHandler}>
      <LinearGradient
        colors={[Colours.primary, Colours.accent1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.signinButton}
      >
        <Text style={styles.signinButtonText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ButtonGradient;

const styles = StyleSheet.create({
  signinButton: {
    width: "100%",
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  signinButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: "Raleway_500Medium",
  },
  disabled: {
    opacity: 0.8,
  },
});
