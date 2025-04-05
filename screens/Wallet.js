import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ToastAndroid,
} from "react-native";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import { StatusBar } from "expo-status-bar";
import ButtonGradient from "../components/ButtonGradient";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "../screens/LoadingScreen";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import Animation from "../assets/nodata.json";
import ModalError from "../components/ModalError";
import { Timestamp } from "firebase/firestore";

const Wallet = ({ navigation }) => {
  const { userData, removeCard, retrieveCard, transactions, sendNotification } =
    useContext(AuthContext);
  const [removeCardLoading, setRemoveCardLoading] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [isCardLinked, setIsCardLinked] = useState(userData.cardLinked);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatTime = (time) => {
    const eventDateTime =
      time instanceof Timestamp ? time.toDate() : new Date(time);
    const day = eventDateTime.toLocaleString("en-us", { weekday: "short" });
    const month = eventDateTime.toLocaleString("en-us", { month: "short" });
    const date = eventDateTime.getDate();
    return `${day}, ${month} ${date}`;
  };

  const handleAddCard = () => {
    navigation.navigate("AddNewCard");
  };

  const handleTopUp = async () => {
    try {
      setTopUpLoading(true);
      const response = await retrieveCard();

      if (response.length > 0) {
        navigation.navigate("Topup", {
          id: response[0].id,
          cardHolderName: response[0].cardHolderName,
          cardNumber: response[0].cardNumber,
          expiryDate: response[0].expiryDate,
          cvv: response[0].cvv,
        });
      } else {
        console.log("No items found in Wallet response");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleRemoveCard = async () => {
    // Display confirmation dialog
    Alert.alert(
      "Confirm",
      "Are you sure you want to remove the card?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setRemoveCardLoading(true);
            try {
              await removeCard();
              sendNotification(
                "Card Removed",
                "Your credit card has been removed successfully!"
              );
              setIsCardLinked(false);
              ToastAndroid.show(
                "Card removed successfully!",
                ToastAndroid.SHORT
              );
            } catch (error) {
              console.log(error);
            }
            setRemoveCardLoading(false);
          },
        },
      ],
      { cancelable: false }
    );
  };

  // If user data is not available, show loading screen
  if (!userData) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving user data..."
      />
    );
  }

  if (removeCardLoading) {
    return (
      <LoadingScreen defaultText="Processing" loadingText="Removing card..." />
    );
  }

  if (topUpLoading) {
    return (
      <LoadingScreen
        defaultText="Processing"
        loadingText="Retrieving card..."
      />
    );
  }

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>My Wallet</Text>
      </View>

      <View style={styles.walletContainer}>
        <View style={styles.balanceContainer}>
          <Text style={styles.name}>Hello {userData.username},</Text>
          <Text style={styles.availableBalance}>Your available balance</Text>
        </View>
        <View style={styles.balance}>
          <Text style={styles.amount}>Rs {userData.walletBalance}</Text>
        </View>
      </View>

      {isCardLinked ? (
        <LinearGradient
          colors={[Colours.primary, Colours.accent1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionContainer}
        >
          <TouchableOpacity style={styles.actionButtons} onPress={handleTopUp}>
            <Ionicons name="card-outline" size={26} color="white" />
            <Text style={styles.actionText}>Top Up</Text>
          </TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={22} color="white" />
          <TouchableOpacity
            style={styles.actionButtons}
            onPress={handleRemoveCard}
          >
            <Ionicons name="trash" size={26} color="white" />
            <Text style={styles.actionText}>Remove</Text>
          </TouchableOpacity>
        </LinearGradient>
      ) : (
        <View style={styles.addContainer}>
          <ButtonGradient
            authHandler={handleAddCard}
            loading={false}
            text="Add Card"
          />
        </View>
      )}

      <ScrollView style={styles.transactionContainer}>
        {transactions && transactions.length > 0 ? (
          <View>
            <Text style={styles.transactionTitle}>Recent Transactions</Text>
            {/* Sort transactions by createdAt in descending order */}
            {transactions
              .filter((transaction) => transaction.transactionAmount !== "Free")
              .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()) // Sort by descending order
              .map((transaction) => (
                <View key={transaction.id} style={styles.transaction}>
                  <View style={styles.transactionDetailsContainer}>
                    <View style={styles.transactionDetails}>
                      <Ionicons
                        name="card-outline"
                        size={40}
                        color={Colours.primary}
                      />
                      <View style={styles.transactionTitleDate}>
                        <Text style={styles.transactionReason}>
                          {transaction.transactionType}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatTime(transaction.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionAmountContainer}>
                    <Text
                      style={
                        transaction.transactionType === "Top-up" ||
                        transaction.transactionStatus === "Cancelled"
                          ? styles.transactionTopup
                          : styles.transactionBooking
                      }
                    >
                      {transaction.transactionType === "Top-up" ||
                      transaction.transactionStatus === "Cancelled"
                        ? "+ "
                        : "- "}
                      Rs {transaction.transactionAmount}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.noTransaction}>
            <LottieView
              source={Animation}
              autoPlay
              loop
              style={styles.animation}
            />
            <Text style={styles.noTransactionText}>No transactions yet!</Text>
          </View>
        )}
      </ScrollView>

      <ModalError
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        title="Oops, Error!"
        message="An error occurred while processing your request. Please try again later."
      />
      <StatusBar style="auto" />
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
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

  walletContainer: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceContainer: {
    justifyContent: "space-between",
    height: 44,
  },
  name: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    color: Colours.text,
  },
  availableBalance: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colours.lightText,
  },
  amount: {
    fontSize: 24,
    fontFamily: FontFamily.boldAlt,
    color: Colours.text,
  },

  addContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: -15,
  },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 30,
  },
  actionButtons: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "white",
    marginTop: 5,
  },

  transactionContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 30,
  },
  transactionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    color: Colours.text,
    marginBottom: 10,
  },
  transaction: {
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#dedede",
    borderWidth: 1,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionTitleDate: {
    marginLeft: 20,
  },
  transactionReason: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Colours.text,
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colours.lightText,
  },
  transactionAmountContainer: {
    alignItems: "flex-end",
  },
  transactionBooking: {
    fontSize: 20,
    fontFamily: FontFamily.boldAlt,
    color: Colours.danger,
  },
  transactionTopup: {
    fontSize: 20,
    fontFamily: FontFamily.boldAlt,
    color: Colours.success,
  },

  noTransaction: {
    alignItems: "center",
    marginTop: 10,
  },
  noTransactionText: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginTop: 5,
  },
  animation: {
    width: 180,
    height: 180,
    marginTop: 20,
  },
});
