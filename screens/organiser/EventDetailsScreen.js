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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "react-native-paper";
import MapView from "react-native-maps";
import * as Location from "expo-location";

import Colours from "../../constants/Colours";
import FontFamily from "../../constants/Fonts";
import OrganiserProfile from "../../assets/organiser.jpg";
import CustomMarker from "../../components/CustomMarker";
import { AuthContext } from "../../context/AuthContext";
import LocationError from "../../components/LocationError";
import ButtonGradient from "../../components/ButtonGradient";
import ErrorMessage from "../../components/ErrorMessage";
import ModalSuccess from "../../components/ModalSuccess";
import ModalError from "../../components/ModalError";
import ModalPostpone from "../../components/organiser/ModalPostpone";

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
    coordinates,
    price,
    eventType,
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
  } = useContext(AuthContext);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modal, setModal] = useState(false);
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

  const handlePostpone = () => {
    setModal(true);
  };

  const handleEditEvent = () => {
    navigation.navigate("EditEvent", {
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
      price,
      eventType,
    });
  };

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
            {eventType === "upcoming" && (
              <View style={styles.rightContainer}>
                <TouchableOpacity style={styles.icon} onPress={handleEditEvent}>
                  <Ionicons name="create-outline" size={28} color="black" />
                </TouchableOpacity>
              </View>
            )}
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
            <View style={styles.dateLocation}>
              <Ionicons
                style={styles.eventIcon}
                name="person-add"
                size={20}
                color={Colours.primary}
              />
              <Text style={styles.text}>{max_attendees} max</Text>
            </View>
            <View style={styles.dateLocation}>
              <Ionicons
                style={styles.eventIcon}
                name="cash"
                size={20}
                color={Colours.primary}
              />
              <Text style={styles.text}>Rs {price}</Text>
            </View>
          </View>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About Event</Text>
            <Text style={styles.aboutText}>{details}</Text>
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
        {eventType === "upcoming" ? (
          <TouchableOpacity onPress={handlePostpone}>
            <LinearGradient
              colors={[Colours.primary, Colours.accent1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Postpone Event</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <LinearGradient
            colors={[Colours.primary, Colours.accent1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Completed</Text>
          </LinearGradient>
        )}
      </View>

      <ModalPostpone
        visible={modal}
        onClose={() => {
          setModal(false);
        }}
        existingDate={date}
        eventId={id}
        eventName={text}
        navigation={navigation}
      />

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
    elevation: 10, // Elevation for Android
    borderTopWidth: 1,
    borderTopColor: "#e9e9e9",
    borderLeftWidth: 1,
    borderLeftColor: "#e9e9e9",
    borderRightWidth: 1,
    borderRightColor: "#e9e9e9",
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    color: "white",
  },
});
