import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import FontFamily from "../constants/Fonts";
import Slider from "@react-native-community/slider";
import Colours from "../constants/Colours";
import { AuthContext } from "../context/AuthContext";

const FilterPriceRange = ({ priceRange, setPriceRange }) => {
  const [price, setPrice] = useState(priceRange);

  const handlePriceRange = (value) => {
    setPriceRange(value);
  };

  return (
    <View style={styles.priceRange}>
      <Text style={styles.subTitle}>Price Range</Text>
      <View style={styles.priceRangeContainer}>
        <View style={styles.priceRangeSlider}>
          <Text style={styles.priceRangeText}>Free</Text>
          <Text style={styles.priceRangeText}>Rs {priceRange}</Text>
        </View>
        <View style={styles.priceRangeSlider}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5000}
            step={500}
            onValueChange={(value) => setPrice(value)}
            onSlidingComplete={handlePriceRange}
            value={priceRange}
            minimumTrackTintColor={Colours.accent1}
            thumbTintColor={Colours.accent1}
          />
        </View>
      </View>
    </View>
  );
};

export default FilterPriceRange;

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  priceRangeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  priceRangeSlider: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceRangeText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
