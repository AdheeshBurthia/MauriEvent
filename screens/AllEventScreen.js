import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import { Ionicons } from "@expo/vector-icons";
import FilterCardList from "../components/FilterCardList";
import FilterCardSmall from "../components/FilterCardSmall";
import { AuthContext } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const AllEventScreen = ({ route }) => {
  const { userData, toggleView } = useContext(AuthContext);
  const [listView, setListView] = useState(userData.listView);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { allEvents, title } = route.params;
  const navigation = useNavigation();

  const filteredEvents = useMemo(() => {
    return selectedCategory === "All"
      ? allEvents
      : allEvents.filter((event) => event.category.includes(selectedCategory));
  }, [selectedCategory, allEvents]);

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
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
          <Text style={styles.displayFound}>{numOfEvents} events found</Text>
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
      {listView ? (
        <FilterCardList
          latestEvents={filteredEvents}
          navigation={navigation}
          screen="Events"
        />
      ) : (
        <FilterCardSmall
          latestEvents={filteredEvents}
          navigation={navigation}
          screen="Events"
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default AllEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  headerContainer: {
    backgroundColor: "white",
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android
    zIndex: 1,
  },
  header: {
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingLeft: 16,
    paddingBottom: 4,
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
});
