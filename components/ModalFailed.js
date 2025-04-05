import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { sendEmailVerification } from "firebase/auth";
import LottieView from "lottie-react-native";

import Colours from "../constants/Colours";
import { auth } from "../config/firebase";
import ModalSuccess from "./ModalSuccess";
import FailedAnimation from "../assets/failed.json";

const ModalFailed = ({ visible, onClose, title, message }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const sendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser)
      .then(() => {
        setModalVisible(true);
        console.log("Verification email sent");
      })
      .catch((error) => {
        console.log("Error sending verification email:", error);
      });
  };
  const handleResend = () => {
    try {
      sendVerificationEmail();
      onClose();
    } catch (error) {
      console.log("Error resending verification email:", error);
    }
  };

  return (
    <SafeAreaView>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.container}>
            <LottieView
              source={FailedAnimation}
              autoPlay
              loop={false}
              style={styles.animation}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResend}
              style={styles.buttonResend}
            >
              <Text style={styles.buttonResendText}>
                Resend Verification Link
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <StatusBar style="auto" backgroundColor={Colours.modalBackground} />
      </Modal>
      <ModalSuccess
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        title="Successful!"
        message="A verification link has been sent to your email address. Please verify your email to log in."
      />
    </SafeAreaView>
  );
};

export default ModalFailed;

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
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 20,
    fontFamily: "Raleway_700Bold",
    color: Colours.danger,
    marginTop: -10,
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
