import React, { useContext, useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import SearchFilter from "./SearchFilter";
import { AuthContext } from "../context/AuthContext";
import { Badge } from "react-native-paper";

const SearchBar = ({ term, setSearchTerm, onTermChange, onPressBack }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState(0);
  const { selectedCategories, selectedDateRange, priceRange } =
    useContext(AuthContext);

  // update filter state
  useEffect(() => {
    let newFilter = 0;
    if (!selectedCategories.includes("All")) {
      newFilter++;
    }
    if (selectedDateRange !== "All") {
      newFilter++;
    }
    if (priceRange !== 5000) {
      newFilter++;
    }
    setFilter(newFilter);
  }, [selectedCategories, selectedDateRange, priceRange]);

  const handleFilter = () => {
    Keyboard.dismiss();
    setShowFilter(true);
    setSearchTerm("");
  };

  return (
    <View>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={onPressBack} style={styles.iconBack}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Find amazing events..."
          value={term}
          onChangeText={onTermChange}
          returnKeyType="search"
          autoFocus={true}
        />
        <TouchableOpacity onPress={handleFilter} style={styles.iconFilter}>
          {filter ? <Badge style={styles.badge} size={8}></Badge> : null}
          <Ionicons
            name="options-outline"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
      </View>
      <SearchFilter showFilter={showFilter} setShowFilter={setShowFilter} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    position: "relative",
  },
  input: {
    position: "absolute",
    fontSize: 16,
    fontFamily: FontFamily.regular,
    width: "100%",
    paddingLeft: 50,
  },
  iconBack: {
    paddingHorizontal: 15,
    zIndex: 1,
  },
  iconFilter: {
    position: "absolute",
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 1,
  },
  badge: {
    position: "absolute",
    right: 10,
    top: 2,
    zIndex: 1,
  },
});

export default SearchBar;
