import React, { useCallback, useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import { StatusBar } from "expo-status-bar";
import FontFamily from "../constants/Fonts";
import FilterPriceRange from "./FilterPriceRange";
import FilterCategories from "./FilterCategories";
import FilterDateRange from "./FilterDateRange";
import { AuthContext } from "../context/AuthContext";
import {
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const SearchFilter = ({ showFilter, setShowFilter }) => {
  const {
    selectedCategories,
    setSelectedCategories,
    selectedDateRange,
    setSelectedDateRange,
    priceRange,
    setPriceRange,
    userData,
    setFilteredEvents,
  } = useContext(AuthContext);

  const [newCategories, setNewCategories] = useState(selectedCategories);
  const [newDate, setNewDate] = useState(selectedDateRange);
  const [newPrice, setNewPrice] = useState(priceRange);

  useEffect(() => {
    setNewCategories(selectedCategories);
    setNewDate(selectedDateRange);
    setNewPrice(priceRange);
  }, [showFilter]);

  useEffect(() => {
    // Select "All" if no category is selected
    if (newCategories.length === 0) {
      setNewCategories(["All"]);
    }
  }, [newCategories]);

  const handleApplyFilter = useCallback(() => {
    let filteredEvents = userData.userEvents;

    // Filter by categories
    if (!newCategories.includes("All")) {
      filteredEvents = filteredEvents.filter((event) =>
        newCategories.includes(event.category)
      );
    }

    // Filter by date range
    if (newDate !== "All") {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      const startOfTomorrow = startOfDay(
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
      );
      const endOfTomorrow = endOfDay(
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
      );

      switch (newDate) {
        case "Today":
          filteredEvents = filteredEvents.filter((event) =>
            isWithinInterval(new Date(event.datetime.seconds * 1000), {
              start: startOfToday,
              end: endOfToday,
            })
          );
          break;
        case "Tomorrow":
          filteredEvents = filteredEvents.filter((event) =>
            isWithinInterval(new Date(event.datetime.seconds * 1000), {
              start: startOfTomorrow,
              end: endOfTomorrow,
            })
          );
          break;
        case "This week":
          filteredEvents = filteredEvents.filter((event) =>
            isWithinInterval(new Date(event.datetime.seconds * 1000), {
              start: startOfWeek(today),
              end: endOfWeek(today),
            })
          );
          break;
        case "This month":
          filteredEvents = filteredEvents.filter((event) =>
            isWithinInterval(new Date(event.datetime.seconds * 1000), {
              start: startOfMonth(today),
              end: endOfMonth(today),
            })
          );
          break;
        default:
          break;
      }
    }

    // Filter by price range
    if (newPrice === 0) {
      filteredEvents = filteredEvents.filter((event) => event.price === "Free");
    } else {
      filteredEvents = filteredEvents.filter(
        (event) => event.price <= newPrice
      );
    }

    setFilteredEvents(filteredEvents);
    setSelectedCategories(newCategories);
    setSelectedDateRange(newDate);
    setPriceRange(newPrice);
    setShowFilter(false);
  }, [newCategories, newDate, newPrice]);

  const handleResetFilter = useCallback(() => {
    setFilteredEvents(userData.userEvents);
    setSelectedCategories(["All"]);
    setSelectedDateRange("All");
    setPriceRange(5000);
    setNewCategories(["All"]);
    setNewDate("All");
    setNewPrice(5000);
    setShowFilter(false);
  }, []);

  return (
    <Modal visible={showFilter} transparent animationType="fade">
      <View style={styles.modal}>
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilter(false)}
                style={styles.iconClose}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colours.extraLightText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <FilterCategories
            selectedCategories={newCategories}
            setSelectedCategories={setNewCategories}
          />

          <FilterDateRange
            selectedDateRange={newDate}
            setSelectedDateRange={setNewDate}
          />

          <FilterPriceRange priceRange={newPrice} setPriceRange={setNewPrice} />

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilter}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilter}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <StatusBar style="auto" backgroundColor={Colours.modalBackground} />
    </Modal>
  );
};

export default SearchFilter;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.modalBackground,
  },
  filterContainer: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 25,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginRight: -35,
  },
  iconClose: {
    marginLeft: 20,
  },

  filterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  resetButton: {
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colours.mediumBackground,
  },
  resetButtonText: {
    color: Colours.primary,
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
  applyButton: {
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colours.primary,
  },
  applyButtonText: {
    color: "white",
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
});
