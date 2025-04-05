import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import SearchBar from "../components/SearchBar";
import Colours from "../constants/Colours";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import Fuse from "fuse.js";
import FontFamily from "../constants/Fonts";
import { Timestamp } from "firebase/firestore";

const SearchScreen = ({ navigation }) => {
  const { filteredEvents } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  // Fuse.js instance will be created whenever userData.userEvents change
  useEffect(() => {
    if (filteredEvents) {
      fuse.setCollection(filteredEvents);
    }
  }, [filteredEvents]);

  // Fuse.js instance
  const fuse = new Fuse(filteredEvents, {
    keys: ["name"],
    threshold: 0.1,
    distance: 100,
    includeScore: true,
  });

  // Function to process the search term
  const processSearchTerm = (term) => {
    setSearchTerm(term);
    if (term === "") {
      setResults([]);
      return;
    }
    const searchResult = fuse
      .search(term)
      .filter((result) => result.score <= 0.2);
    setResults(
      searchResult.length ? searchResult.map((result) => result.item) : null
    );
  };

  // Function to highlight the matching part of the text
  const highlightMatchingText = (text, searchTerm) => {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;
    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);
    return (
      <Text>
        {before}
        <Text style={styles.boldText}>{match}</Text>
        {after}
      </Text>
    );
  };

  const formatDateTime = (datetime) => {
    const eventDateTime =
      datetime instanceof Timestamp ? datetime.toDate() : datetime;
    const day = eventDateTime.toLocaleString("en-us", { weekday: "short" });
    const month = eventDateTime.toLocaleString("en-us", { month: "short" });
    const date = eventDateTime.getDate();
    const hours = eventDateTime.getHours() % 12 || 12;
    const minutes = eventDateTime.getMinutes().toString().padStart(2, "0");
    const ampm = eventDateTime.getHours() >= 12 ? "PM" : "AM";
    return `${day}, ${month} ${date} at ${hours}:${minutes} ${ampm}`;
  };

  // Function to handle event press
  const handleEventPress = (event) => {
    const formattedDateTime = formatDateTime(event.datetime);
    navigation.navigate("EventDetails", {
      id: event.id,
      category: event.category,
      text: event.name,
      image: event.image,
      date: formattedDateTime,
      location: event.location,
      coordinates: event.coordinates,
      attending: event.attending,
      organiserId: event.organiserId,
      organiserUsername: event.organiserUsername,
      organiserEmail: event.organiserEmail,
      organiserProfileURL: event.organiserProfileURL,
      max_attendees: event.max_attendees,
      details: event.details,
      isLiked: event.isLiked,
      isBooked: event.isBooked,
      price: event.price,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        term={searchTerm}
        setSearchTerm={setSearchTerm}
        onTermChange={processSearchTerm}
        onPressBack={() => navigation.goBack()}
      />
      {searchTerm === "" ? null : results === null ? (
        <Text style={styles.notFoundText}>
          Event not found for "{searchTerm}"
        </Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleEventPress(item)}>
              <Text style={styles.itemText}>
                {highlightMatchingText(item.name, searchTerm)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  itemText: {
    padding: 16,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  notFoundText: {
    padding: 16,
    fontSize: 16,
    textAlign: "center",
    color: "red",
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default SearchScreen;
