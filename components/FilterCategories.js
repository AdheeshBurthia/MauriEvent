import { useContext, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";

const FilterCategories = ({ selectedCategories, setSelectedCategories }) => {
  const { userData } = useContext(AuthContext);

  const toggleCategorySelection = useCallback((category) => {
    setSelectedCategories((prevSelectedCategories) => {
      if (category === "All") {
        return prevSelectedCategories.includes("All") ? [] : ["All"];
      } else {
        if (prevSelectedCategories.includes("All")) {
          return [category];
        }
        return prevSelectedCategories.includes(category)
          ? prevSelectedCategories.filter((c) => c !== category)
          : [...prevSelectedCategories, category];
      }
    });
  }, []);

  const sortedCategories = ["All", ...userData.categories.sort()];

  return (
    <View style={styles.categories}>
      <Text style={styles.subTitle}>Categories</Text>
      <View style={styles.categoryButtonsContainer}>
        {sortedCategories.map((category, index) =>
          selectedCategories.includes(category) ? (
            <TouchableOpacity
              key={index}
              onPress={() => toggleCategorySelection(category)}
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
              onPress={() => toggleCategorySelection(category)}
            >
              <Text style={styles.categoryButtonText}>{category}</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

export default FilterCategories;

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  categoryButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryButton: {
    marginRight: 10,
    marginBottom: 10,
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
    marginBottom: 10,
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
});
