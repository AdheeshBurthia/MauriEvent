import { useContext, useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Linking,
  Alert,
  ToastAndroid,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "react-native-paper";
import MapView from "react-native-maps";
import { parse, differenceInDays } from "date-fns";
import * as Location from "expo-location";
import * as Calendar from "expo-calendar";

import Colours from "../constants/Colours";
import FontFamily from "../constants/Fonts";
import OrganiserProfile from "../assets/organiser.jpg";
import CustomMarker from "../components/CustomMarker";
import { AuthContext } from "../context/AuthContext";
import LocationError from "../components/LocationError";
import ButtonGradient from "../components/ButtonGradient";
import ErrorMessage from "../components/ErrorMessage";
import ModalSuccess from "../components/ModalSuccess";
import ModalError from "../components/ModalError";
import DefaultImage from "../assets/placeholder.png";

const EventDetailsScreen = ({ route, navigation }) => {
  const {
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
    isLiked,
    isBooked,
    coordinates,
    price,
  } = route.params;
  const {
    userId,
    userData,
    myLatitude,
    myLongitude,
    setMyLatitude,
    setMyLongitude,
    isLocationAvailable,
    setIsLocationAvailable,
    likeEvent,
    unlikeEvent,
    bookEvent,
    sendNotification,
    addBooking,
  } = useContext(AuthContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFavourite, setIsFavourite] = useState(isLiked);
  const [isBookedEvent, setIsBookedEvent] = useState(isBooked);
  const [isBookingClosed, setIsBookingClosed] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [truncatedText, setTruncatedText] = useState(text);
  const [truncatedDate, setTruncatedDate] = useState(date);
  const [truncatedLocation, setTruncatedLocation] = useState(location);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [isModalError, setIsModalError] = useState(false);
  const textRef = useRef(null);
  const dateRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    // Parse the event date string to a Date object
    const now = new Date();
    const eventDateObject = parse(date, "EEE, MMM dd 'at' h:mm a", new Date());

    // Calculate the difference in days between the event date and now
    const daysLeft = differenceInDays(eventDateObject, now);

    if (daysLeft < 2) {
      setIsBookingClosed(true);
    }
  }, [date]);

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

  useEffect(() => {
    if (attending >= max_attendees) {
      setIsFull(true);
    } else {
      setIsFull(false);
    }
  }, [attending, max_attendees]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event!🔥\n\n*Name:* ${text}\n*Date:* ${date}\n*Location:* ${location}\n\n${image}`,
      });
    } catch (error) {
      ToastAndroid.show("Error sharing event", ToastAndroid.SHORT);
      console.log("Error sharing event:", error.message);
    }
  };

  const handleFavourite = () => {
    if (isFavourite) {
      setIsFavourite(false);
      unlikeEvent(id);
      ToastAndroid.show("Event removed from favourites", ToastAndroid.SHORT);
    } else {
      setIsFavourite(true);
      likeEvent(id);
      ToastAndroid.show("Event added to favourites", ToastAndroid.SHORT);
    }
  };

  const openGoogleMapsDirections = () => {
    if (!isLocationAvailable) {
      setIsModalVisible(true);
      return;
    }
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${myLatitude},${myLongitude}&destination=${coordinates.latitude},${coordinates.longitude}`;

    Linking.openURL(directionsUrl);
  };

  const getPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log("currentLatitude:", currentLocation.coords.latitude);
      console.log("currentLongitude:", currentLocation.coords.longitude);
      setMyLatitude(currentLocation.coords.latitude);
      setMyLongitude(currentLocation.coords.longitude);
      setIsLocationAvailable(true); // Set the location availability to true
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:${organiserEmail}`;

    // Open the default mail application
    Linking.openURL(mailtoUrl)
      .then(() => {
        console.log(
          `Opened mail application to send email to ${organiserEmail}`
        );
      })
      .catch((err) => {
        ToastAndroid.show(
          "Failed to open mail application",
          ToastAndroid.SHORT
        );
        console.log("Failed to open mail application:", err);
      });
  };

  const handleBookings = () => {
    setError("");
    setShowOrderDetails(true);
  };

  const addToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      console.log("Calendar permission denied");
      ToastAndroid.show("Calendar permission denied", ToastAndroid.SHORT);
      return;
    }

    try {
      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find((cal) => cal.allowsModifications);

      const eventDate = parse(date, "EEE, MMM dd 'at' h:mm a", new Date());
      const startDate = new Date(eventDate);
      const endDate = new Date(eventDate);
      const eventTitle = text;
      const eventLocation = location;

      startDate.setHours(9); // Set the start time to 9 AM
      endDate.setHours(17); // Set the end time to 5 PM

      const eventDetails = {
        title: eventTitle,
        startDate,
        endDate,
        location: eventLocation,
      };

      const eventId = await Calendar.createEventAsync(
        defaultCalendar.id,
        eventDetails
      );

      console.log("Event created with ID:", eventId);
      ToastAndroid.show("Event added to calendar", ToastAndroid.SHORT);
    } catch (error) {
      console.log("Error adding event to calendar:", error);
      ToastAndroid.show("Error adding event to calendar", ToastAndroid.SHORT);
    }
  };

  const handleBookEvent = async () => {
    setError("");

    if (price > userData.walletBalance) {
      setError("Insufficient balance in wallet.");
      return;
    }

    setLoading(true);
    try {
      await addBooking(id, date, price, organiserId); // Assuming addBooking is asynchronous
      sendNotification(
        "Booking",
        `Your ticket booking for ${text} was successful!`
      );

      // Show alert to add to calendar
      Alert.alert(
        "Add to Calendar",
        "Do you want to add this booking to your calendar?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsBookedEvent(true);
              setModalSuccess(true);
              console.log("Booking added successfully");
            },
          },
          {
            text: "OK",
            onPress: () => {
              // Logic to add booking to calendar can be added here
              // For example, you can call a function to add to calendar
              addToCalendar(); // Replace addToCalendar with your actual function
              setIsBookedEvent(true);
              setModalSuccess(true);
              console.log("Booking added successfully");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      setIsModalError(true);
      console.log("Error adding booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showOrderDetails) {
    return (
      <View style={styles.orderContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.goBack}
            onPress={() => setShowOrderDetails(false)}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colours.extraLightText}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Order Details</Text>
        </View>

        <View style={styles.eventCard}>
          <Image source={{ uri: image }} style={styles.cardImage} />
          <View style={styles.cardDetailsContainer}>
            <Text style={styles.cardCategory}>{category}</Text>
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
              <Avatar.Image size={22} source={OrganiserProfile} />
            </View>
          </View>
        </View>

        <View style={styles.orderDetailsContainer}>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Username</Text>
            <Text style={styles.orderUsername}>{userData.username}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Email</Text>
            <Text style={styles.orderUsername}>{userData.email}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Wallet Balance</Text>
            <Text style={styles.orderUsername}>
              Rs {userData.walletBalance}
            </Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Booking Price</Text>
            <Text style={styles.orderUsername}>
              {price === "Free" ? price : `Rs ${price}`}
            </Text>
          </View>
        </View>

        <ModalSuccess
          visible={modalSuccess}
          onClose={() => {
            setModalSuccess(false);
            setShowOrderDetails(false);
          }}
          title="Successful!"
          message="Your booking has been confirmed successfully!"
        />

        <ModalError
          visible={isModalError}
          onClose={() => {
            setIsModalError(false);
            setShowOrderDetails(false);
          }}
          title="Oops, Error!"
          message="An error occurred while processing your request. Please try again later."
        />

        {error ? <ErrorMessage error={error} /> : null}

        <View style={styles.orderButtonContainer}>
          <ButtonGradient
            authHandler={handleBookEvent}
            loading={loading}
            text="Confirm Booking"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image style={styles.image} source={{ uri: image }} />
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.rightContainer}>
              <TouchableOpacity style={styles.icon} onPress={handleShare}>
                <Ionicons name="share-social" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.icon} onPress={handleFavourite}>
                <Ionicons
                  name={isFavourite ? "heart" : "heart-outline"}
                  size={24}
                  color="red"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{category}</Text>
          </View>
          <Text style={styles.name}>{text}</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateLocation}>
              <Ionicons
                style={styles.eventIcon}
                name="calendar"
                size={20}
                color={Colours.primary}
              />
              <Text style={styles.text}>{date}</Text>
            </View>
            <View style={styles.dateLocation}>
              <Ionicons
                style={styles.eventIcon}
                name="location"
                size={20}
                color={Colours.primary}
              />
              <Text style={styles.text}>{location}</Text>
            </View>
            <View style={styles.dateLocation}>
              <Ionicons
                style={styles.eventIcon}
                name="people"
                size={20}
                color={Colours.primary}
              />
              <Text style={styles.text}>{attending} attending</Text>
            </View>
          </View>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About Event</Text>
            <Text style={styles.aboutText}>{details}</Text>
          </View>
          <View style={styles.organiserContainer}>
            <Text style={styles.organiserTitle}>Organiser</Text>
            <View style={styles.organiserDetails}>
              <View style={styles.organiserImage}>
                {organiserProfileURL ? (
                  <Avatar.Image
                    size={50}
                    source={{ uri: organiserProfileURL }}
                  />
                ) : (
                  <Avatar.Image size={50} source={DefaultImage} />
                )}
                <View style={styles.organiserText}>
                  <Text style={styles.organiserName}>{organiserUsername}</Text>
                  <Text style={styles.organiserSubtitle}>Event Organiser</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.organiserMessage}
                onPress={handleSendEmail}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={22}
                  color={Colours.primary}
                  style={styles.organiserIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.locationTitle}>
            <Text style={styles.locationText}>Location</Text>
            <TouchableOpacity onPress={openGoogleMapsDirections}>
              <Text style={styles.viewMap}>View in Map</Text>
            </TouchableOpacity>
          </View>

          {/* Displaying the small map */}
          <View style={styles.mapContainer}>
            {coordinates && (
              <MapView
                style={styles.smallMap}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                }}
              >
                <CustomMarker coordinates={coordinates} image={image} />
              </MapView>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSubContainer}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPrice}>Total Price: </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {price === "Free" ? price : `Rs ${price}`}
              </Text>
              <Text style={styles.person}> / person</Text>
            </View>
          </View>

          {/* Display the Book Now button */}
          {!isBookedEvent ? (
            !isFull ? (
              !isBookingClosed ? (
                <TouchableOpacity onPress={handleBookings}>
                  <LinearGradient
                    colors={[Colours.primary, Colours.accent1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Book Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <LinearGradient
                  colors={[Colours.primary, Colours.accent1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Ticket Closed</Text>
                </LinearGradient>
              )
            ) : (
              <LinearGradient
                colors={[Colours.primary, Colours.accent1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Event Full</Text>
              </LinearGradient>
            )
          ) : (
            <LinearGradient
              colors={[Colours.primary, Colours.accent1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Booked</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      <LocationError
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          getPermission();
        }}
        title="Oops, Failed!"
        message="Please enable location access to proceed to Google Maps."
      />
      <ExpoStatusBar style="light" />
    </View>
  );
};

export default EventDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  orderContainer: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 42,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  eventCard: {
    width: "100%",
    height: 130,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 9,
    flexDirection: "row",
    marginBottom: 12,
  },
  cardImage: {
    width: 116,
    height: "100%",
    borderRadius: 18,
  },
  cardDetailsContainer: {
    marginLeft: 12,
    marginVertical: 8,
    justifyContent: "space-between",
    width: "57%",
  },
  cardCategory: {
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
  orderDetailsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 22,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  orderTitle: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
  },
  orderUsername: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  orderButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  headerContainer: {
    height: 300,
    width: "100%",
    backgroundColor: "black",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  rightContainer: {
    flexDirection: "row",
  },
  icon: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "white",
    borderRadius: 50,
  },
  detailsContainer: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 250 : 250,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  scrollContainer: {
    paddingBottom: 80,
    padding: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  category: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: "row",
    color: Colours.accent2,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    borderRadius: 50,
    backgroundColor: "#fff5d9",
  },
  name: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    paddingVertical: 10,
  },
  dateContainer: {
    paddingVertical: 10,
  },
  dateLocation: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    paddingBottom: 10,
  },
  text: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
    paddingLeft: 12,
    paddingRight: 20,
  },
  eventIcon: {
    padding: 12,
    backgroundColor: "#f0ecff",
    borderRadius: 50,
  },
  aboutContainer: {
    paddingVertical: 5,
  },
  aboutTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 5,
  },
  aboutText: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
    color: Colours.lightText,
    textAlign: "justify",
  },
  organiserContainer: {
    paddingVertical: 15,
  },
  organiserTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 5,
  },
  organiserDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  organiserImage: {
    flexDirection: "row",
    alignItems: "center",
  },
  organiserText: {
    marginLeft: 10,
  },
  organiserName: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  organiserSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: Colours.lightText,
  },
  organiserMessage: {
    padding: 9,
    backgroundColor: "#f0ecff",
    borderRadius: 50,
  },
  organiserIcon: {
    padding: 5,
  },
  locationTitle: {
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewMap: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: Colours.primary,
  },
  locationText: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 5,
  },
  mapContainer: {
    height: 200,
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 5,
  },
  smallMap: {
    width: "100%",
    height: "100%",
  },

  buttonContainer: {
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    backgroundColor: "#ffffff",
    width: "100%",
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: "#e9e9e9",
    borderLeftWidth: 1,
    borderLeftColor: "#e9e9e9",
    borderRightWidth: 1,
    borderRightColor: "#e9e9e9",
  },
  buttonSubContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPriceContainer: {},
  totalPrice: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  priceContainer: {
    flexDirection: "row",
  },
  price: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Colours.accent1Alt,
  },
  person: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "white",
  },
});
