import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Logo from "../assets/logoShadow.png";
import Colours from "../constants/Colours";

const AuthHeader = ({ title }) => {
  return (
    <View style={styles.header}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 100,
  },
  title: {
    fontSize: 26,
    marginTop: 10,
    fontFamily: "Raleway_700Bold",
    color: Colours.dark,
  },
});

export default AuthHeader;
