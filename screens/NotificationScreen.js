import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import FontFamily from "../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import LottieView from "lottie-react-native";
import Animation from "../assets/noNotification.json";
import { StatusBar } from "expo-status-bar";
import { AuthContext } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const NotificationScreen = ({ navigation }) => {
  const { userData, userNotifications, markNotificationAsRead } =
    useContext(AuthContext);

  // Get notifications and sort by timestamp in descending order
  const notifications = (userNotifications?.list || []).sort((a, b) => {
    return b.notificationTimestamp.toDate() - a.notificationTimestamp.toDate();
  });

  // Function to mark notification as read
  const handleMarkNotification = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  // Utility function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JS Date object
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Render item for FlatList
  const renderNotificationItem = ({ item }) => (
    <View
      style={[
        styles.notificationItem,
        item.readStatus && styles.notificationReadItem,
      ]}
    >
      <Ionicons
        name={
          item.notificationHeader === "Booking"
            ? "wallet-outline"
            : item.notificationHeader === "Top-Up"
            ? "cash-outline"
            : item.notificationHeader === "Withdrawal"
            ? "cash-outline"
            : item.notificationHeader === "Card Linked"
            ? "card-outline"
            : item.notificationHeader === "Booking Cancelled"
            ? "close-circle-outline"
            : item.notificationHeader === "Card Removed"
            ? "card-outline"
            : "person-outline"
        }
        size={20}
        color={Colours.primary}
        style={styles.icon}
      />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationType}>{item.notificationHeader}</Text>
          <Text style={styles.notificationTimestamp}>
            {formatTimestamp(item.notificationTimestamp)}
          </Text>
        </View>
        <Text style={styles.notificationMessage}>
          {item.notificationMessage}
        </Text>
        {item.readStatus === false && (
          <TouchableOpacity
            style={styles.markReadContainer}
            onPress={() => handleMarkNotification(item.id)}
          >
            <Text style={styles.markRead}>Mark as read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
        <Text style={styles.title}>Notifications</Text>
      </View>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noNotification}>
          <LottieView
            source={Animation}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.noNotificationText}>You're all caught up!</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 13,
    paddingHorizontal: 16,
    borderBottomColor: "#dedede",
    borderBottomWidth: 2,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },

  notificationItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    borderBottomColor: "#dedcff",
    borderBottomWidth: 1,
    backgroundColor: "#ffffff",
  },
  notificationReadItem: {
    backgroundColor: "#f6f5ff",
  },
  icon: {
    marginTop: 2,
  },
  notificationContent: {
    marginLeft: 10,
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  notificationType: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: Colours.lightText,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colours.darkText,
  },
  markReadContainer: {
    paddingTop: 8,
    paddingRight: 10,
  },
  markRead: {
    fontSize: 13,
    color: Colours.primary,
    fontFamily: FontFamily.bold,
  },

  noNotification: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noNotificationText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    marginTop: -80,
  },
  animation: {
    width: 300,
    height: 300,
    marginTop: -130,
  },
});

export default NotificationScreen;
