import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colours from "../constants/Colours";

const SkeletonLarge = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}></View>
      <View style={styles.detailsContainer}>
        <View style={styles.eventName}></View>
        <View style={styles.eventLocation}></View>
        <View style={styles.dateContainer}>
          <View style={styles.eventDate}></View>
          <View style={styles.avatar}></View>
        </View>
      </View>
    </View>
  );
};

export default SkeletonLarge;

const styles = StyleSheet.create({
  container: {
    width: 250,
    marginRight: 16,
    marginTop: 2,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 14,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: Colours.skeletonContent,
    borderRadius: 22,
  },
  detailsContainer: {
    paddingTop: 20,
  },
  eventName: {
    width: "80%",
    height: 20,
    backgroundColor: Colours.skeletonContent,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventLocation: {
    width: "60%",
    height: 20,
    backgroundColor: Colours.skeletonContent,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventDate: {
    width: "30%",
    height: 20,
    backgroundColor: Colours.skeletonContent,
    borderRadius: 10,
  },
  avatar: {
    width: 23,
    height: 23,
    backgroundColor: Colours.skeletonContent,
    borderRadius: 15,
    marginLeft: 10,
  },
});
