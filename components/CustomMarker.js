import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Marker } from "react-native-maps";
import Colours from "../constants/Colours";

const CustomMarker = ({ coordinates, image }) => {
  return (
    <Marker coordinate={coordinates} style={styles.container}>
      <View style={styles.marker}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>
      <View style={styles.pointer} />
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderColor: Colours.primary,
    borderWidth: 6,
    zIndex: 1,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 12,
    borderRightWidth: 9,
    borderBottomWidth: 0,
    borderLeftWidth: 9,
    borderTopColor: Colours.primary,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    marginTop: -2,
    zIndex: 0,
  },
  image: {
    width: 33,
    height: 33,
    borderRadius: 20,
  },
});

export default CustomMarker;
