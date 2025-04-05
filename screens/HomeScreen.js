import { StatusBar } from "expo-status-bar";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";
import Colours from "../constants/Colours";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchContainer from "../components/SearchContainer";
import HeaderContainer from "../components/HeaderContainer";
import LatestEvent from "../components/LatestEvent";
import PopularEvent from "../components/PopularEvent";
import ModalError from "../components/ModalError";
import * as Location from "expo-location";

const HomeScreen = ({ navigation }) => {
  const {
    userData,
    logout,
    setMyLatitude,
    setMyLongitude,
    setIsLocationAvailable,
    filteredEvents,
    setFilteredEvents,
    getTransactions,
    getAllMedia,
    getUserNotifications,
    userImage,
    setUpPushNotifications,
  } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setUpPushNotifications();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (filteredEvents === null) {
      setFilteredEvents(userData.userEvents);
    }
  }, [userData.userEvents]);

  useEffect(() => {
    const getPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setMyLatitude(currentLocation.coords.latitude);
        setMyLongitude(currentLocation.coords.longitude);
        setIsLocationAvailable(true); // Set the location availability to true
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };
    getPermission();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await getAllMedia();
    } catch (error) {
      console.log("Error fetching media:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getUserNotifications();
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Loading user data..."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderContainer userProfile={userImage} navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subContainer}
      >
        <SearchContainer navigation={navigation} />
        <View style={styles.eventContent}>
          <LatestEvent navigation={navigation} />
          <PopularEvent navigation={navigation} />
        </View>
      </ScrollView>

      {isModalVisible && (
        <ModalError
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            logout();
          }}
          title="Oops, Error!"
          message="Error getting your data. Please log in again."
        />
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.darkerBackground,
  },
  subContainer: {
    zIndex: -1,
  },
  eventContent: {
    backgroundColor: Colours.mediumBackground,
  },
});
