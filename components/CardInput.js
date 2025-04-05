import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import ErrorMessage from "./ErrorMessage";
import ButtonGradient from "./ButtonGradient";

const CardInput = ({
  cardNumber,
  cardHolder,
  expiryDate,
  cvv,
  setCardNumber,
  setCardHolder,
  setExpiryDate,
  setCvv,
  formatCardNumber,
  formatExpiryDate,
  flip,
  cardNumberError,
  cardHolderError,
  expiryDateError,
  cvvError,
  error,
  handleValidation,
  loading,
}) => {
  const [isCardNumberFocused, setIsCardNumberFocused] = useState(false);
  const [isCardHolderFocused, setIsCardHolderFocused] = useState(false);
  const [isExpiryDateFocused, setIsExpiryDateFocused] = useState(false);
  const [isCvvFocused, setIsCvvFocused] = useState(false);

  const labelPositionCardNumber = useSharedValue(cardNumber ? -16 : 16);
  const labelPositionCardHolder = useSharedValue(cardHolder ? -16 : 16);
  const labelPositionExpiryDate = useSharedValue(expiryDate ? -16 : 16);
  const labelPositionCvv = useSharedValue(cvv ? -16 : 16);

  const labelStyleCardNumber = useAnimatedStyle(() => {
    return {
      top: withTiming(labelPositionCardNumber.value, { duration: 200 }),
    };
  });

  const labelStyleCardHolder = useAnimatedStyle(() => {
    return {
      top: withTiming(labelPositionCardHolder.value, { duration: 200 }),
    };
  });

  const labelStyleExpiryDate = useAnimatedStyle(() => {
    return {
      top: withTiming(labelPositionExpiryDate.value, { duration: 200 }),
    };
  });

  const labelStyleCvv = useAnimatedStyle(() => {
    return {
      top: withTiming(labelPositionCvv.value, { duration: 200 }),
    };
  });

  const handleCardNumberFocus = () => {
    setIsCardNumberFocused(true);
    labelPositionCardNumber.value = -16;
  };

  const handleCardHolderFocus = () => {
    setIsCardHolderFocused(true);
    labelPositionCardHolder.value = -16;
  };

  const handleExpiryDateFocus = () => {
    setIsExpiryDateFocused(true);
    labelPositionExpiryDate.value = -16;
  };

  const handleCvvFocus = () => {
    flip.value = 1;
    setIsCvvFocused(true);
    labelPositionCvv.value = -16;
  };

  const handleCardNumberBlur = () => {
    if (!cardNumber) {
      setIsCardNumberFocused(false);
      labelPositionCardNumber.value = 16;
    }
  };

  const handleCardHolderBlur = () => {
    if (!cardHolder) {
      setIsCardHolderFocused(false);
      labelPositionCardHolder.value = 16;
    }
  };

  const handleExpiryDateBlur = () => {
    if (!expiryDate) {
      setIsExpiryDateFocused(false);
      labelPositionExpiryDate.value = 16;
    }
  };

  const handleCvvBlur = () => {
    flip.value = 0;
    if (!cvv) {
      setIsCvvFocused(false);
      labelPositionCvv.value = 16;
    }
  };

  const handleCardNumberChange = (number) => {
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned.length <= 16) {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryDateChange = (date) => {
    const cleaned = date.replace(/\s+/g, "");
    if (cleaned.length <= 5) {
      setExpiryDate(cleaned);
    }
  };

  const handleCvvChange = (number) => {
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  const cardNumberRef = useRef(null);
  const cardHolderRef = useRef(null);
  const expiryDateRef = useRef(null);
  const cvvRef = useRef(null);

  return (
    <View style={styles.cardDetails}>
      <View
        style={[
          styles.inputContainer,
          isCardNumberFocused && styles.inputContainerFocused,
          cardNumberError && styles.errorInputContainer,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            isCardNumberFocused && styles.labelFocused,
            cardNumberError && styles.errorLabel,
            labelStyleCardNumber,
          ]}
        >
          Card Number
        </Animated.Text>
        <TextInput
          ref={cardNumberRef}
          style={styles.input}
          placeholder=""
          value={formatCardNumber(cardNumber)}
          autoCapitalize="none"
          onChangeText={handleCardNumberChange}
          onFocus={handleCardNumberFocus}
          onBlur={handleCardNumberBlur}
          keyboardType="numeric"
          returnKeyType="next"
          onSubmitEditing={() => cardHolderRef.current.focus()}
        />
        <Icon
          name="credit-card"
          size={20}
          color={
            cardNumberError
              ? Colours.danger
              : isCardNumberFocused
              ? Colours.primary
              : Colours.iconLight
          }
          style={styles.icon}
        />
      </View>
      <View
        style={[
          styles.inputContainer,
          isCardHolderFocused && styles.inputContainerFocused,
          cardHolderError && styles.errorInputContainer,
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            isCardHolderFocused && styles.labelFocused,
            cardHolderError && styles.errorLabel,
            labelStyleCardHolder,
          ]}
        >
          Card Holder
        </Animated.Text>
        <TextInput
          ref={cardHolderRef}
          style={styles.input}
          placeholder=""
          value={cardHolder}
          autoCapitalize="words"
          onChangeText={(cardHolder) => setCardHolder(cardHolder)}
          onFocus={handleCardHolderFocus}
          onBlur={handleCardHolderBlur}
          returnKeyType="next"
          onSubmitEditing={() => expiryDateRef.current.focus()}
        />
        <Icon
          name="user"
          size={20}
          color={
            cardHolderError
              ? Colours.danger
              : isCardHolderFocused
              ? Colours.primary
              : Colours.iconLight
          }
          style={styles.icon}
        />
      </View>

      <View style={styles.detailContainer}>
        <View
          style={[
            styles.inputContainer,
            isExpiryDateFocused && styles.inputContainerFocused,
            expiryDateError && styles.errorInputContainer,
          ]}
        >
          <Animated.Text
            style={[
              styles.label,
              isExpiryDateFocused && styles.labelFocused,
              expiryDateError && styles.errorLabel,
              labelStyleExpiryDate,
            ]}
          >
            Expiry Date
          </Animated.Text>
          <TextInput
            ref={expiryDateRef}
            style={styles.input}
            placeholder=""
            value={formatExpiryDate(expiryDate)}
            autoCapitalize="words"
            onChangeText={handleExpiryDateChange}
            onFocus={handleExpiryDateFocus}
            onBlur={handleExpiryDateBlur}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => cvvRef.current.focus()}
          />
          <Icon
            name="clock-o"
            size={20}
            color={
              expiryDateError
                ? Colours.danger
                : isExpiryDateFocused
                ? Colours.primary
                : Colours.iconLight
            }
            style={styles.icon}
          />
        </View>
        <View
          style={[
            styles.inputContainer,
            isCvvFocused && styles.inputContainerFocused,
            cvvError && styles.errorInputContainer,
          ]}
        >
          <Animated.Text
            style={[
              styles.label,
              isCvvFocused && styles.labelFocused,
              cvvError && styles.errorLabel,
              labelStyleCvv,
            ]}
          >
            CVV
          </Animated.Text>
          <TextInput
            ref={cvvRef}
            style={styles.input}
            placeholder=""
            value={cvv}
            autoCapitalize="words"
            onChangeText={handleCvvChange}
            onFocus={handleCvvFocus}
            onBlur={handleCvvBlur}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Icon
            name="lock"
            size={20}
            color={
              cvvError
                ? Colours.danger
                : isCvvFocused
                ? Colours.primary
                : Colours.iconLight
            }
            style={styles.icon}
          />
        </View>
      </View>

      {error ? <ErrorMessage error={error} /> : null}

      <View style={styles.buttonContainer}>
        <ButtonGradient
          authHandler={handleValidation}
          loading={loading}
          text="Proceed"
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

export default CardInput;

const styles = StyleSheet.create({
  cardDetails: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
    color: Colours.primary,
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
    backgroundColor: "white",
    fontSize: 12,
    fontFamily: FontFamily.regular,
    padding: 5,
  },

  buttonContainer: {
    marginTop: 20,
  },
});
