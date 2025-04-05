import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import EventImage from "../assets/sports.png";
import FontFamily from "../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import OrganiserProfile from "../assets/organiser.jpg";
import { Avatar } from "react-native-paper";

const EventCardSmall = ({
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
  screen,
  navigation,
  price,
}) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const [truncatedDate, setTruncatedDate] = useState(date);
  const [truncatedLocation, setTruncatedLocation] = useState(location);
  const textRef = useRef(null);
  const dateRef = useRef(null);
  const locationRef = useRef(null);

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
    if (dateRef.current) {
      const availableWidth = dateRef.current.measure((fx, fy, width) => width);
      const actualWidth = dateRef.current.measureInWindow((width) => width);
      if (actualWidth > availableWidth) {
        const numberOfCharsToFit =
          Math.floor((availableWidth / actualWidth) * date.length) - 3; // Subtracting 3 to account for ellipses
        setTruncatedDate(date.substring(0, numberOfCharsToFit) + "...");
      } else {
        setTruncatedDate(date);
      }
    }
  }, [date]);

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

  const eventDetails = () => {
    if (screen === "Events") {
      return "EventDetails";
    } else if (screen === "Favourites") {
      return "FavouriteDetails";
    } else if (screen === "Tickets") {
      return "TicketDetails";
    }
  };

  const handleCardPress = async () => {
    navigation.navigate(eventDetails(), {
      id,
      category,
      text,
      image,
      date,
      location,
      attending,
      organiserId,
      organiserUsername,
      organiserEmail,
      organiserProfileURL,
      max_attendees,
      details,
      isLiked,
      isBooked,
      coordinates,
      price,
    });
  };

  return (
    <TouchableOpacity onPress={handleCardPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.category}>{category}</Text>
          {/* <View style={styles.favourite}>
            <Ionicons name="heart" size={18} color="red" />
          </View> */}
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
            <Text
              ref={locationRef}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.eventDate}
            >
              {truncatedDate}
            </Text>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.locationSubContainer}>
            <Ionicons name="location" size={16} color={Colours.primary} />
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
            <Avatar.Image size={20} source={{ uri: organiserProfileURL }} />
          ) : (
            <Avatar.Image size={20} source={DefaultImage} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCardSmall;

const styles = StyleSheet.create({
  container: {
    width: 157,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 8,
    marginBottom: 13,
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
    padding: 10,
  },
  category: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: "white",
    fontFamily: FontFamily.bold,
    fontSize: 11,
    borderRadius: 16,
  },
  image: {
    height: 110,
    borderRadius: 18,
    width: "100%",
  },
  eventContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventName: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    paddingTop: 6,
    paddingLeft: 2,
  },
  eventDate: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colours.primary,
    paddingLeft: 2,
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
    fontSize: 13,
    fontFamily: FontFamily.regular,
    paddingLeft: 5,
    flex: 1,
  },
});
