import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import FontFamily from "../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import OrganiserProfile from "../assets/organiser.jpg";
import { Avatar } from "react-native-paper";

const EventCardLarge = ({
  id,
  category,
  image,
  text,
  date,
  location,
  attending,
  organiserId,
  organiserUsername,
  organiserEmail,
  organiserProfileURL,
  max_attendees,
  details,
  coordinates,
  isLiked,
  isBooked,
  navigation,
  price,
}) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const [truncatedLocation, setTruncatedLocation] = useState(location);
  const locationRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const availableWidth = textRef.current.measure((fx, fy, width) => width);
      const actualWidth = textRef.current.measureInWindow((width) => width);
      if (actualWidth > availableWidth) {
        const numberOfCharsToFit =
          Math.floor((availableWidth / actualWidth) * text.length) - 3; // Subtracting 3 to account for ellipses
        setTruncatedText(text.substring(0, numberOfCharsToFit) + "...");
      } else {
        setTruncatedText(text);
      }
    }
  }, [text]);

  useEffect(() => {
    if (locationRef.current) {
      const availableWidth = locationRef.current.measure(
        (fx, fy, width) => width
      );
      const actualWidth = locationRef.current.measureInWindow((width) => width);
      if (actualWidth > availableWidth) {
        const numberOfCharsToFit =
          Math.floor((availableWidth / actualWidth) * location.length) - 3;
        setTruncatedLocation(location.substring(0, numberOfCharsToFit) + "...");
      } else {
        setTruncatedLocation(location);
      }
    }
  }, [location]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate("EventDetails", {
          id,
          category,
          image,
          text,
          date,
          location,
          coordinates,
          attending,
          organiserId,
          organiserUsername,
          organiserEmail,
          organiserProfileURL,
          max_attendees,
          details,
          isLiked,
          isBooked,
          price,
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.category}>{category}</Text>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <Text
          ref={textRef}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.eventName}
        >
          {truncatedText}
        </Text>
        <View style={styles.eventContainer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={18} color={Colours.primary} />
            <Text style={styles.eventDate}>{date}</Text>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.locationSubContainer}>
            <Ionicons name="location" size={18} color={Colours.primary} />
            <Text
              ref={locationRef}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.location}
            >
              {truncatedLocation}
            </Text>
          </View>
          {organiserProfileURL ? (
            <Avatar.Image size={25} source={{ uri: organiserProfileURL }} />
          ) : (
            <Avatar.Image size={25} source={DefaultImage} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCardLarge;

const styles = StyleSheet.create({
  container: {
    width: 250,
    marginRight: 16,
    marginTop: 2,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 14,
  },
  imageContainer: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  category: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "white",
    fontFamily: FontFamily.bold,
    fontSize: 12,
    borderRadius: 16,
  },
  favourite: {
    padding: 5,
    backgroundColor: "white",
    borderRadius: 30,
  },
  image: {
    height: 160,
    borderRadius: 18,
    width: "100%",
  },
  eventContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventName: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    paddingTop: 14,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.primary,
    paddingLeft: 6,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
    flex: 1,
  },
  location: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    paddingLeft: 6,
    flex: 1,
  },
});
