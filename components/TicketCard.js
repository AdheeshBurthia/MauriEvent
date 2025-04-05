import { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from "react-native";
import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import * as Calendar from "expo-calendar";

const TicketCard = ({
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
  status,
  setModalSuccess,
  setIsModalError,
}) => {
  const [truncatedText, setTruncatedText] = useState(text);
  const [truncatedDate, setTruncatedDate] = useState(date);
  const [truncatedLocation, setTruncatedLocation] = useState(location);
  const [loading, setLoading] = useState(false);
  const textRef = useRef(null);
  const dateRef = useRef(null);
  const locationRef = useRef(null);

  const { sendNotification, cancelBooking } = useContext(AuthContext);

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

  const removeFromCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      console.log("Calendar permission denied");
      ToastAndroid.show("Calendar permission denied", ToastAndroid.SHORT);
      return;
    }

    try {
      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find((cal) => cal.allowsModifications);

      const events = await Calendar.getEventsAsync(
        [defaultCalendar.id],
        new Date(),
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // Get events for the next year
      );

      const event = events.find((event) => event.title === text);
      if (event) {
        await Calendar.deleteEventAsync(event.id);
        console.log("Event removed from calendar");
        ToastAndroid.show("Event removed from calendar", ToastAndroid.SHORT);
      } else {
        console.log("Event not found in calendar");
        ToastAndroid.show("Event not found in calendar", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error removing event from calendar:", error);
      ToastAndroid.show(
        "Error removing event from calendar",
        ToastAndroid.SHORT
      );
    }
  };

  const handleCancelBooking = () => {
    // Display confirmation dialog
    Alert.alert(
      "Confirm",
      "Are you sure you want to cancel this event?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setLoading(true);
            try {
              cancelBooking(id, price, date, organiserId);
              removeFromCalendar();
              sendNotification(
                "Booking Cancelled",
                `Your ticket booking for ${text} was cancelled!`
              );
              setModalSuccess(true);
            } catch (error) {
              setIsModalError(true);
              console.log(error);
            }
            setLoading(false);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleViewTicket = () => {
    navigation.navigate("ViewTicket", {
      id,
      text,
      date,
      location,
      price,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.topContainer} onPress={handleCardPress}>
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
            {status === "Paid" ? (
              <Text style={styles.paid}>Paid</Text>
            ) : status === "Completed" ? (
              <Text style={styles.completed}>Completed</Text>
            ) : (
              <Text style={styles.cancelled}>Cancelled</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {status === "Paid" && (
        <View style={styles.bottomContainer}>
          {loading ? (
            <TouchableOpacity style={styles.loader}>
              <ActivityIndicator size="small" color={Colours.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancel}
              onPress={handleCancelBooking}
            >
              <Text style={styles.buttonCancel}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleViewTicket}>
            <LinearGradient
              colors={[Colours.primary, Colours.accent1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonView}>View E-Ticket</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      {status === "Completed" && (
        <View style={styles.bottomCompletedContainer}>
          <TouchableOpacity onPress={handleViewTicket}>
            <LinearGradient
              colors={[Colours.primary, Colours.accent1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCompletedButton}
            >
              <Text style={styles.buttonView}>View E-Ticket</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TicketCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 22,
  },
  topContainer: {
    width: "100%",
    height: 130,
    padding: 9,
    flexDirection: "row",
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
  paid: {
    fontSize: 10,
    color: Colours.primary,
    borderColor: Colours.primary,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 2,
    fontFamily: FontFamily.medium,
  },
  completed: {
    fontSize: 10,
    color: Colours.success,
    borderColor: Colours.success,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 2,
    fontFamily: FontFamily.medium,
  },
  cancelled: {
    fontSize: 10,
    color: Colours.danger,
    borderColor: Colours.danger,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 2,
    fontFamily: FontFamily.medium,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colours.outline,
    paddingVertical: 10,
  },
  bottomCompletedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colours.outline,
    paddingVertical: 10,
  },
  loader: {
    backgroundColor: "white",
    borderColor: Colours.primary,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 63,
    paddingVertical: 5,
  },
  cancel: {
    backgroundColor: "white",
    borderColor: Colours.primary,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 5,
  },
  gradientButton: {
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 5,
  },
  gradientCompletedButton: {
    borderRadius: 30,
    paddingHorizontal: 102,
    paddingVertical: 5,
  },
  buttonCancel: {
    color: Colours.primary,
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
  buttonView: {
    color: "white",
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
});
