import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import CardInput from "../components/CardInput";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import ModalSuccess from "../components/ModalSuccess";

const AddNewCard = ({ navigation }) => {
  const { addCard, sendNotification } = useContext(AuthContext);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [cardNumberError, setCardNumberError] = useState(false);
  const [cardHolderError, setCardHolderError] = useState(false);
  const [expiryDateError, setExpiryDateError] = useState(false);
  const [cvvError, setCvvError] = useState(false);
  const [error, setError] = useState("");

  const flip = useSharedValue(0);

  const frontCardStyle = useAnimatedStyle(() => {
    const flipValue = interpolate(flip.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateY: withTiming(`${flipValue}deg`, { duration: 500 }),
        },
      ],
    };
  });

  const backCardStyle = useAnimatedStyle(() => {
    const flipValue = interpolate(flip.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateY: withTiming(`${flipValue}deg`, { duration: 500 }),
        },
      ],
    };
  });

  const formatCardNumber = (number) => {
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (date) => {
    return date.replace(/(\d{2})(?=\d)/g, "$1/");
  };

  const validateCardNumber = (cardNumber) => {
    const cleanedCardNumber = cardNumber.replace(/[-\s]/g, "");
    if (!/^\d{12,19}$/.test(cleanedCardNumber)) {
      setCardNumberError(true);
      return false;
    }
    setCardNumberError(false);
    return true;
  };

  const validateCardHolder = (cardHolder) => {
    if (!cardHolder.trim()) {
      setCardHolderError(true);
      return false;
    }
    setCardHolderError(false);
    return true;
  };

  const validateExpiryDate = (expiryDate) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      setExpiryDateError(true);
      return false;
    }

    const [month, year] = expiryDate.split("/");
    const currentDate = new Date();
    const expiryYear = parseInt(`20${year}`, 10);
    const expiryMonth = parseInt(month, 10) - 1;

    const expiryDateObj = new Date(expiryYear, expiryMonth, 1);

    if (expiryDateObj <= currentDate) {
      setExpiryDateError(true);
      return false;
    }

    setExpiryDateError(false);
    return true;
  };

  const validateCvv = (cvv) => {
    if (!/^\d{3,4}$/.test(cvv)) {
      setCvvError(true);
      return false;
    }
    setCvvError(false);
    return true;
  };

  const handleValidation = async () => {
    // Reset all error states and error message
    setCardNumberError(false);
    setCardHolderError(false);
    setExpiryDateError(false);
    setCvvError(false);
    setError("");

    // Validate each input field
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      if (!cardNumber) setCardNumberError(true);
      if (!cardHolder) setCardHolderError(true);
      if (!expiryDate) setExpiryDateError(true);
      if (!cvv) setCvvError(true);
      setError("Please fill in all fields.");
      return;
    }

    if (!validateCardNumber(cardNumber)) {
      setError("Please enter a valid card number.");
      return;
    }
    if (!validateCardHolder(cardHolder)) {
      setError("Please enter the card holder name.");
      return;
    }
    if (!validateExpiryDate(expiryDate)) {
      setError("Please enter a valid expiry date in MM/YY format.");
      return;
    }
    if (!validateCvv(cvv)) {
      setError("Please enter a valid CVV number.");
      return;
    }

    setLoading(true);

    try {
      const response = await addCard(cardNumber, cardHolder, expiryDate, cvv);
      if (response) {
        setModalVisible(true);
        sendNotification(
          "Card Linked",
          "Your credit card has been linked successfully!"
        );
      } else {
        setError("Invalid credit card data.");
      }
    } catch (error) {
      setError("Failed to add card. Please try again later.");
      console.log("Error adding card:", error);
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
        <Text style={styles.title}>Add New Card</Text>
      </View>

      <View style={styles.form}>
        <Animated.View style={[styles.frontCard, frontCardStyle]}>
          <View style={styles.frontView}>
            <Image
              source={require("../assets/frontCard.png")}
              style={styles.card}
            />
            <Text style={styles.cardNumber}>
              {formatCardNumber(cardNumber)}
            </Text>
            <Text style={styles.expiryDate}>
              {formatExpiryDate(expiryDate)}
            </Text>
            <Text style={styles.cardHolder}>{cardHolder.toUpperCase()}</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.backCard, backCardStyle]}>
          <View style={styles.backView}>
            <Image
              source={require("../assets/backCard.png")}
              style={styles.card}
            />
            <Text style={styles.cvv}>{cvv}</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.cardInput}>
        <CardInput
          cardNumber={cardNumber}
          cardHolder={cardHolder}
          expiryDate={expiryDate}
          cvv={cvv}
          setCardNumber={setCardNumber}
          setCardHolder={setCardHolder}
          setExpiryDate={setExpiryDate}
          setCvv={setCvv}
          formatCardNumber={formatCardNumber}
          formatExpiryDate={formatExpiryDate}
          flip={flip}
          cardNumberError={cardNumberError}
          cardHolderError={cardHolderError}
          expiryDateError={expiryDateError}
          cvvError={cvvError}
          error={error}
          handleValidation={handleValidation}
          loading={loading}
        />
      </ScrollView>
      {modalVisible && (
        <ModalSuccess
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            navigation.navigate("ProfileScreen");
          }}
          title="Successful!"
          message="Your credit card has been linked successfully!"
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default AddNewCard;

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
  form: {
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
  cvv: {
    fontSize: 17,
    fontFamily: FontFamily.mediumAlt,
    color: Colours.cardDark,
    position: "absolute",
    bottom: 90,
    right: 130,
  },
  frontView: {
    width: 310,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  backView: {
    width: 310,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  frontCard: {
    position: "absolute",
    backfaceVisibility: "hidden",
  },
  backCard: {
    backfaceVisibility: "hidden",
  },
});
