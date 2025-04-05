import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import QRCode from "react-native-qrcode-svg";

const ViewTicketScreen = ({ navigation, route }) => {
  const { userData, userId } = useContext(AuthContext);
  const { id, text, date, location, price } = route.params;

  return (
    <View style={styles.orderContainer}>
      <View style={styles.headerTop}>
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
        <Text style={styles.title}>E-Ticket</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orderDetailsContainer}>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={JSON.stringify({
                id,
                userId,
              })}
              size={120}
            />
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>Event</Text>
            <Text style={styles.orderUsername}>{text}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>Date & Time</Text>
            <Text style={styles.orderUsername}>{date}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>Event Location</Text>
            <Text style={styles.orderUsername}>{location}</Text>
          </View>
        </View>

        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Username</Text>
            <Text style={styles.orderUsername}>{userData.username}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Email</Text>
            <Text style={styles.orderUsername}>{userData.email}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Wallet Balance</Text>
            <Text style={styles.orderUsername}>
              Rs {userData.walletBalance}
            </Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Total Price</Text>
            <Text style={styles.orderUsername}>
              {price === "Free" ? price : `Rs ${price}`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ViewTicketScreen;

const styles = StyleSheet.create({
  orderContainer: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
    marginHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 42,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  orderDetailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 22,
    marginTop: 12,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 15,
    padding: 16,
  },
  eventDetails: {
    paddingVertical: 10,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
  },
  orderUsername: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  orderButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
