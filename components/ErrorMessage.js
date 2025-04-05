import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const ErrorMessage = ({ error }) => {
  return (
    <View style={styles.errorContainer}>
      <Icon
        name="exclamation-circle"
        size={20}
        color={Colours.danger}
        style={styles.errorIcon}
      />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};

export default ErrorMessage;

const styles = StyleSheet.create({
  errorContainer: {
    marginLeft: 20,
    flexDirection: "row",
  },
  errorText: {
    color: Colours.danger,
    marginLeft: 10,
    fontFamily: FontFamily.regular,
  },
});
