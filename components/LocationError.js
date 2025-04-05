import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";

import Colours from "../constants/Colours";
import LocationAnimation from "../assets/location.json";

const LocationError = ({ visible, onClose, title, message }) => {
  const openSetting = () => {
    Linking.openSettings();
  };

  return (
    <SafeAreaView>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.container}>
            <LottieView
              source={LocationAnimation}
              autoPlay
              loop
              style={styles.animation}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSetting} style={styles.buttonResend}>
              <Text style={styles.buttonResendText}>Open Device Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
        <StatusBar style="auto" backgroundColor={Colours.modalBackground} />
      </Modal>
    </SafeAreaView>
  );
};

export default LocationError;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.modalBackground,
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 40,
    alignItems: "center",
    width: "80%",
  },
  animation: {
    width: 180,
    height: 180,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Raleway_700Bold",
    color: Colours.danger,
    marginTop: -20,
    marginBottom: 5,
  },
  message: {
    textAlign: "center",
    padding: 10,
    lineHeight: 20,
    fontFamily: "Raleway_400Regular",
    fontSize: 15,
    color: Colours.mediumText,
  },
  button: {
    width: "97%",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colours.danger,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 5,
  },
  buttonText: {
    color: "white",
    fontFamily: "Raleway_700Bold",
  },
  buttonResend: {
    width: "97%",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colours.lightBackground,
    borderRadius: 25,
    marginTop: 5,
    marginBottom: 5,
  },
  buttonResendText: {
    color: Colours.danger,
    fontFamily: "Raleway_700Bold",
  },
});
