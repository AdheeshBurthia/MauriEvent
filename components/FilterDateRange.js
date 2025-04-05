import { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";

const FilterDateRange = ({ selectedDateRange, setSelectedDateRange }) => {
  const handleDateRangeSelection = useCallback((dateRange) => {
    setSelectedDateRange(dateRange);
  }, []);

  return (
    <View style={styles.dateRange}>
      <Text style={styles.subTitle}>Date Range</Text>
      <View style={styles.dateRangeContainer}>
        {["All", "Today", "Tomorrow", "This week", "This month"].map(
          (dateRange, index) => (
            <View key={index}>
              {selectedDateRange === dateRange ? (
                <TouchableOpacity
                  onPress={() => handleDateRangeSelection(dateRange)}
                >
                  <LinearGradient
                    colors={[Colours.primary, Colours.accent1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text
                      style={[
                        styles.dateRangeButtonText,
                        styles.selectedDateRangeButtonText,
                      ]}
                    >
                      {dateRange}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleDateRangeSelection(dateRange)}
                  style={styles.dateRangeButton}
                >
                  <Text style={styles.dateRangeButtonText}>{dateRange}</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )}
      </View>
    </View>
  );
};

export default FilterDateRange;

const styles = StyleSheet.create({
  subTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  dateRangeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  dateRangeButton: {
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "white",
    borderRadius: 30,
    borderColor: Colours.primary,
    borderWidth: 2,
  },
  selectedDateRangeButton: {
    backgroundColor: Colours.primary,
    borderWidth: 0,
  },
  dateRangeButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colours.primary,
  },
  selectedDateRangeButtonText: {
    color: "white",
  },
});
