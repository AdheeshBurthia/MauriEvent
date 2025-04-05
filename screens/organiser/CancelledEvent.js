import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CancelledEvent = (props) => {
  return (
    <View style={styles.container}>
      <Text>CancelledEvent</Text>
    </View>
  );
};

export default CancelledEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
