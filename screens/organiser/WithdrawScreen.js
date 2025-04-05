import React, { useContext, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Colours from "../../constants/Colours";
import FontFamily from "../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import ErrorMessage from "../../components/ErrorMessage";
import ButtonGradient from "../../components/ButtonGradient";
import { AuthContext } from "../../context/AuthContext";
import ModalSuccess from "../../components/ModalSuccess";
import ModalError from "../../components/ModalError";
import { set } from "date-fns";

const WithdrawScreen = ({ route, navigation }) => {
  const { withdrawAmount, getTotalAmount } = useContext(AuthContext);
  const { cardHolderName, cardNumber, expiryDate, cvv } = route.params;

  const [amount, setAmount] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState(false);

  const amountLabelPosition = useRef(
    new Animated.Value(amount ? -16 : 16)
  ).current;
  const handleAmountFocus = () => {
    setIsAmountFocused(true);
    Animated.timing(amountLabelPosition, {
      toValue: -16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleAmountBlur = () => {
    if (!amount) {
      setIsAmountFocused(false);
      Animated.timing(amountLabelPosition, {
        toValue: 16,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const validateAmount = async (amount) => {
    setAmountError(false);
    setError("");
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setAmountError(true);
      setError("Please enter a valid amount!");
      return true;
    }
    return false;
  };

  const handleAmount = (amount) => {
    setAmount(amount);
    validateAmount(amount);
  };

  const formatCardNumber = (number) => {
    // Split the number into first 4 digits, middle 8 digits, and last digits
    const firstFour = number.slice(0, 4);
    const middleEight = "*".repeat(8); // Create a string of 8 asterisks
    const lastFour = number.slice(-4);

    // Concatenate the parts and return
    return `${firstFour} ${middleEight} ${lastFour}`;
  };

  const formatExpiryDate = (date) => {
    return date.replace(/(\d{2})(?=\d)/g, "$1/");
  };

  const handleWithdrawAmount = async () => {
    setAmountError(false);
    setError("");

    const trimmedAmount = amount.trim();

    // Check if field is empty
    if (!trimmedAmount) {
      setAmountError(true);
      setError("Please enter amount to withdraw.");
      return;
    }

    const amountError = await validateAmount(trimmedAmount);

    // Set errors if validation fails
    if (amountError) {
      setAmountError(true);
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const totalAmount = await getTotalAmount();
      if (totalAmount) {
        if (trimmedAmount > totalAmount) {
          setAmountError(true);
          setError(`You cannot withdraw more than ${totalAmount}.`);
          console.log("Total amount:", totalAmount);
          return true;
        }
      }

      const response = await withdrawAmount(parseFloat(amount), cardHolderName);
      if (response.success === false) {
        setError(response.message);
        return;
      }
      setModalSuccess(true);
    } catch (error) {
      setModalError(true);
      console.log("Error adding amount:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw</Text>
      </View>

      <View style={styles.creditCard}>
        <View style={styles.frontView}>
          <Image
            source={require("../../assets/frontCard.png")}
            style={styles.card}
          />
          <Text style={styles.cardNumber}>{formatCardNumber(cardNumber)}</Text>
          <Text style={styles.expiryDate}>{formatExpiryDate(expiryDate)}</Text>
          <Text style={styles.cardHolder}>{cardHolderName.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View
          style={[
            styles.inputContainer,
            isAmountFocused && styles.inputContainerFocused,
            amountError && styles.errorInputContainer,
          ]}
        >
          <Animated.Text
            style={[
              styles.label,
              isAmountFocused && styles.labelFocused,
              amountError && styles.errorLabel,
              { top: amountLabelPosition },
            ]}
          >
            Enter Amount to Withdraw
          </Animated.Text>
          <TextInput
            style={styles.input}
            placeholder=""
            value={amount}
            onChangeText={handleAmount}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
          />
          <Ionicons
            name="wallet-outline"
            size={20}
            color={
              amountError
                ? Colours.danger
                : isAmountFocused
                ? Colours.primary
                : Colours.iconLight
            }
            style={styles.icon}
          />
        </View>
      </View>

      {error ? <ErrorMessage error={error} /> : null}

      <ModalSuccess
        visible={modalSuccess}
        onClose={() => {
          setModalSuccess(false);
          navigation.navigate("ProfileScreen");
        }}
        title="Successful!"
        message="You have successfully withdrawn the amount."
      />

      <ModalError
        visible={modalError}
        onClose={() => {
          setModalError(false);
        }}
        title="Oops, Error!"
        message="An error occurred while withdrawing amount. Please try again."
      />
      <View style={styles.buttonContainer}>
        <ButtonGradient
          authHandler={handleWithdrawAmount}
          loading={loading}
          text="Withdraw Amount"
          S
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginHorizontal: 16,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  creditCard: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  card: {
    width: 320,
    height: 205,
  },
  cardNumber: {
    fontSize: 23,
    fontFamily: FontFamily.mediumAlt,
    color: "white",
    position: "absolute",
    bottom: 69,
    left: 33,
  },
  expiryDate: {
    fontSize: 17,
    fontFamily: FontFamily.mediumAlt,
    color: Colours.cardLight,
    position: "absolute",
    bottom: 41,
    right: 100,
  },
  cardHolder: {
    fontSize: 15,
    fontFamily: FontFamily.boldAlt,
    color: Colours.cardLight,
    position: "absolute",
    bottom: 20,
    left: 35,
  },
  frontView: {
    width: 310,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

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

  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "flex-end",
  },
});
