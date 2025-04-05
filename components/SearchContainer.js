import { StyleSheet, Text, View, ScrollView } from "react-native";
import Colours from "../constants/Colours";
import { Ionicons } from "@expo/vector-icons";
import FontFamily from "../constants/Fonts";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const SearchContainer = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>
        <Text style={styles.discover}>Discover </Text>
        amazing event near by you.
      </Text>
      <View style={styles.search}>
        <Ionicons name="search" size={24} color={Colours.extraLightText} />
        <Text
          style={styles.searchText}
          onPress={() => navigation.navigate("SearchScreen")}
        >
          Find amazing events...
        </Text>
      </View>
      <View style={styles.searchCategories}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {userData.categories.map((category, index) => (
            <Text key={index} style={styles.searchCategory}>
              {category}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default SearchContainer;

const styles = StyleSheet.create({
  searchContainer: {
    paddingTop: 12,
    backgroundColor: "#201a37",
  },
  searchTitle: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    color: "white",
    marginHorizontal: 16,
  },
  discover: {
    color: Colours.accent1,
  },
  search: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 30,
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 30,
    marginHorizontal: 16,
  },
  searchText: {
    position: "absolute",
    fontSize: 16,
    fontFamily: FontFamily.regular,
    paddingHorizontal: 50,
    color: Colours.extraLightText,
    width: "100%",
    paddingVertical: 12,
  },
  searchCategories: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  categoryContainer: {
    paddingLeft: 16,
    paddingRight: 6,
    justifyContent: "center",
  },
  searchCategory: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: "white",
    marginRight: 10,
    backgroundColor: Colours.tagBackground,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
});
