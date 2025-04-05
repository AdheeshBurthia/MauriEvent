import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const SuccessMessage = ({ success }) => {
  return (
    <View style={styles.successContainer}>
      <Icon
        name="check-circle"
        size={20}
        color={Colours.success}
        style={styles.successIcon}
      />
      <Text style={styles.successText}>{success}</Text>
    </View>
  );
};

export default SuccessMessage;

const styles = StyleSheet.create({
  successContainer: {
    marginLeft: 20,
    flexDirection: "row",
  },
  successText: {
    color: Colours.success,
    marginLeft: 10,
    fontFamily: FontFamily.regular,
  },
});
