import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Colours from "../../constants/Colours";
import Card from "../../components/organiser/Card";
import { AuthContext } from "../../context/AuthContext";
import * as Location from "expo-location";
import DefaultImage from "../../assets/placeholder.png";
import { Avatar, Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import FontFamily from "../../constants/Fonts";

const HomeScreen = ({ navigation }) => {
  const {
    userData,
    getStats,
    getOrganiserData,
    setMyLatitude,
    setMyLongitude,
    setIsLocationAvailable,
    getTransactions,
    getUserNotifications,
    userNotifications,
    userImage,
    setUpPushNotifications,
  } = useContext(AuthContext);
  const [greeting, setGreeting] = useState("");
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalGallery, setTotalGallery] = useState(0);
  const [completedEvents, setCompletedEvents] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const getStatsData = async () => {
      try {
        const response = await getStats();
        setStats(response);
        // setTotalEvents(response.totalEvents);
        // setTotalGallery(response.totalMedia);
        // setCompletedEvents(response.completedEvents);
        // setTotalPayout(response.totalWithdrawnAmount);
        // setTotalEarnings(response.totalBookingAmount);
        // setTotalTickets(response.totalBookings);
      } catch (error) {
        console.log("Error fetching stats:", error);
      }
    };
    getStatsData();
  }, []);

  useEffect(() => {
    setUpPushNotifications();
  }, []);

  useEffect(() => {
    getOrganiserData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const getPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        console.log("currentLatitude:", currentLocation.coords.latitude);
        console.log("currentLongitude:", currentLocation.coords.longitude);
        setMyLatitude(currentLocation.coords.latitude);
        setMyLongitude(currentLocation.coords.longitude);
        setIsLocationAvailable(true); // Set the location availability to true
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };
    getPermission();
  }, []);

  useEffect(() => {
    // Get the current hour from the Date object
    const currentHour = new Date().getHours();

    // Set the greeting based on the current hour
    if (currentHour >= 0 && currentHour < 12) {
      setGreeting("Good Morning 👋");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good Afternoon ☀️");
    } else if (currentHour >= 17 && currentHour < 21) {
      setGreeting("Good Evening 🌆");
    } else if (currentHour >= 21 && currentHour < 24) {
      setGreeting("Good Night 🌙");
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getUserNotifications();
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  const cardData = [
    { title: "Total Events", data: stats.totalEvents, icon: "🎉" },
    { title: "Total Gallery", data: stats.totalMedia, icon: "🖼️" },
    { title: "Completed Events", data: stats.completedEvents, icon: "✅" },
    { title: "Total Payout", data: stats.totalWithdrawnAmount, icon: "💵" },
    { title: "Total Earnings", data: stats.totalBookingAmount, icon: "💰" },
    { title: "Total Tickets", data: stats.totalBookings, icon: "🎫" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profile}>
          {userImage ? (
            <Avatar.Image size={50} source={{ uri: userImage }} />
          ) : (
            <Avatar.Image size={50} source={DefaultImage} />
          )}
          <View style={styles.profileText}>
            <Text style={styles.profileTitle}>{greeting}</Text>
            <Text style={styles.profileSubtitle}>{userData.username}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifications}
          onPress={async () => {
            navigation.navigate("Notification");
          }}
        >
          <Ionicons name="notifications-outline" size={22} color="black" />
          {userNotifications?.unReadCount > 0 && (
            <Badge size={6} style={styles.badge}></Badge>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.iconContainer}>
        <Ionicons name="home" size={80} color={Colours.primary} />
        <Text style={styles.iconTitle}>Welcome to MariEvent</Text>
        <Text style={styles.iconSubtitle}>Explore your dashboard</Text>
      </View>

      {/* Cards Section */}
      <ScrollView>
        <View style={styles.cardsContainer}>
          <View style={styles.row}>
            {cardData.slice(0, 2).map((card, index) => (
              <Card
                key={index}
                title={card.title}
                data={card.data}
                icon={card.icon}
              />
            ))}
          </View>
          <View style={styles.row}>
            {cardData.slice(2, 4).map((card, index) => (
              <Card
                key={index}
                title={card.title}
                data={card.data}
                icon={card.icon}
              />
            ))}
          </View>
          <View style={styles.row}>
            {cardData.slice(4, 6).map((card, index) => (
              <Card
                key={index}
                title={card.title}
                data={card.data}
                icon={card.icon}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  iconTitle: {
    fontSize: 24,
    marginTop: 10,
    fontFamily: FontFamily.bold,
  },
  iconSubtitle: {
    fontSize: 14,
    color: Colours.secondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileText: {
    marginLeft: 10,
  },
  profileTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 18,
    fontFamily: FontFamily.light,
  },
  notifications: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default HomeScreen;
