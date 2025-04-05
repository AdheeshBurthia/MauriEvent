import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import EventImage from "../assets/sports.png";
import OrganiserProfile from "../assets/organiser.jpg";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import { Avatar } from "react-native-paper";

const EventCardList = ({
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
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text
          ref={textRef}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.eventName}
        >
          {truncatedText}
        </Text>
        <Text
          ref={locationRef}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.eventDate}
        >
          {truncatedDate}
        </Text>
        <View style={styles.locationContainer}>
          <Text
            ref={locationRef}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.eventLocation}
          >
            {truncatedLocation}
          </Text>
          {organiserProfileURL ? (
            <Avatar.Image size={22} source={{ uri: organiserProfileURL }} />
          ) : (
            <Avatar.Image size={22} source={DefaultImage} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCardList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 130,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 9,
    flexDirection: "row",
    marginBottom: 12,
  },
  image: {
    width: 116,
    height: "100%",
    borderRadius: 18,
  },
  detailsContainer: {
    marginLeft: 12,
    marginVertical: 8,
    justifyContent: "space-between",
    width: "57%",
  },
  category: {
    fontSize: 13,
    color: Colours.accent2,
    fontFamily: FontFamily.medium,
  },
  eventName: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  eventDate: {
    fontSize: 13,
    color: Colours.primary,
    fontFamily: FontFamily.medium,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventLocation: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    paddingRight: 3,
    flex: 1,
  },
});
