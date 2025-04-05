import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Badge } from "react-native-paper";
import LottieView from "lottie-react-native";

import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import FilterCardList from "../components/FilterCardList";
import FilterCardSmall from "../components/FilterCardSmall";
import { AuthContext } from "../context/AuthContext";
import Logo from "../assets/logo.png";
import Animation from "../assets/nodata.json";

const FavouriteScreen = () => {
  const { userData, userNotifications, toggleView } = useContext(AuthContext);
  const [listView, setListView] = useState(userData.listView);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigation = useNavigation();

  const filteredEvents = useMemo(() => {
    const favouriteEventsDetails = userData.userEvents.filter((event) =>
      userData.favouriteEvents.includes(event.id)
    );
    return selectedCategory === "All"
      ? favouriteEventsDetails
      : favouriteEventsDetails.filter((event) =>
          event.category.includes(selectedCategory)
        );
  }, [selectedCategory, userData.favouriteEvents, userData.userEvents]);

  const numOfEvents = filteredEvents.length;

  const filterEventsByCategory = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const toggleListViewOn = useCallback(async () => {
    if (!listView) {
      setListView(true);
      await toggleView(true);
    }
  }, [listView, toggleView]);

  const toggleListViewOff = useCallback(async () => {
    if (listView) {
      setListView(false);
      await toggleView(false);
    }
  }, [listView, toggleView]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.title}>Favourites</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifications}
              onPress={() => navigation.navigate("Notification")}
            >
              <Ionicons name="notifications-outline" size={22} color="black" />
              {userNotifications?.unReadCount > 0 && (
                <Badge size={6} style={styles.badge}></Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.categories}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryButtonsContainer}
          >
            {["All", ...userData.categories].map((category, index) =>
              selectedCategory === category ? (
                <TouchableOpacity
                  key={index}
                  onPress={() => filterEventsByCategory(category)}
                >
                  <LinearGradient
                    colors={[Colours.primary, Colours.accent1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        styles.selectedCategoryButtonText,
                      ]}
                    >
                      {category}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryButton}
                  onPress={() => filterEventsByCategory(category)}
                >
                  <Text style={styles.categoryButtonText}>{category}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
        <View style={styles.displayMethod}>
          <Text style={styles.displayFound}>{numOfEvents} favourites</Text>
          <View style={styles.displayIcons}>
            <TouchableOpacity onPress={toggleListViewOn}>
              <Ionicons
                name="list"
                size={26}
                color={listView ? Colours.accent1 : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleListViewOff}>
              <Ionicons
                name="grid"
                size={20}
                color={listView ? "black" : Colours.accent1}
                style={{ paddingTop: 3, paddingLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {numOfEvents === 0 ? (
        <View style={styles.noFavouritesContainer}>
          <LottieView
            source={Animation}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.noFavouritesText}>No favourites found</Text>
        </View>
      ) : listView ? (
        <FilterCardList
          latestEvents={filteredEvents}
          navigation={navigation}
          screen="Favourites"
        />
      ) : (
        <FilterCardSmall
          latestEvents={filteredEvents}
          navigation={navigation}
          screen="Favourites"
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  headerContainer: {
    backgroundColor: "white",
    elevation: 4,
    zIndex: 1,
  },
  header: {
    paddingTop: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifications: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  logo: {
    width: 70,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  categoryButtonsContainer: {
    paddingLeft: 16,
    paddingVertical: 5,
    paddingBottom: 15,
  },
  categoryButton: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    height: 40,
    backgroundColor: "white",
    borderRadius: 30,
    borderColor: Colours.primary,
    borderWidth: 2,
  },
  gradientButton: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    height: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colours.primary,
  },
  selectedCategoryButtonText: {
    color: "white",
  },
  displayMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  displayFound: {
    fontSize: 17,
    fontFamily: FontFamily.medium,
  },
  displayIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  noFavouritesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 180,
    height: 180,
  },
  noFavouritesText: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colours.primary,
  },
});
