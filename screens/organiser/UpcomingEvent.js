import React, { useContext, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Timestamp } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import Colours from "../../constants/Colours";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Animation from "../../assets/nodata.json";
import FontFamily from "../../constants/Fonts";
import EventCardList from "../../components/organiser/EventCardList";
import LoadingScreen from "../LoadingScreen";

const UpcomingEvent = () => {
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  // Function to format date and time
  const formatDateTime = (datetime) => {
    const eventDateTime =
      datetime instanceof Timestamp ? datetime.toDate() : datetime;
    const day = eventDateTime.toLocaleString("en-us", { weekday: "short" });
    const month = eventDateTime.toLocaleString("en-us", { month: "short" });
    const date = eventDateTime.getDate();
    const hours = eventDateTime.getHours() % 12 || 12;
    const minutes = eventDateTime.getMinutes().toString().padStart(2, "0");
    const ampm = eventDateTime.getHours() >= 12 ? "PM" : "AM";
    return `${day}, ${month} ${date} at ${hours}:${minutes} ${ampm}`;
  };

  // Get today's date
  const today = new Date();

  // Filter and map events from today to the future
  const upcomingEvents = userData.organiserEvents.filter((event) => {
    const eventDate =
      event.datetime instanceof Timestamp
        ? event.datetime.toDate()
        : event.datetime;
    return eventDate >= today;
  });

  const renderEventCard = ({ item }) => {
    const formattedDateTime = formatDateTime(item.datetime);
    return (
      <View style={styles.cardContainer}>
        <EventCardList
          id={item.id}
          category={item.category}
          image={item.image}
          text={item.name}
          date={formattedDateTime}
          location={item.location}
          attending={item.attending}
          organiserId={item.organiserId}
          organiserUsername={item.organiserUsername}
          organiserEmail={item.organiserEmail}
          organiserProfileURL={item.organiserProfileURL}
          max_attendees={item.max_attendees}
          details={item.details}
          coordinates={item.coordinates}
          navigation={navigation}
          price={item.price}
          eventType="upcoming"
        />
      </View>
    );
  };

  if (!userData.organiserEvents)
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving events..."
      />
    );

  return (
    <View style={styles.container}>
      {upcomingEvents.length === 0 ? (
        <View style={styles.animationContainer}>
          <LottieView
            source={Animation}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.noTicketsText}>No upcoming events found!</Text>
        </View>
      ) : (
        <FlatList
          data={upcomingEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardList}
        />
      )}
    </View>
  );
};

export default UpcomingEvent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  cardList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 2,
  },
  cardContainer: {
    marginBottom: 0,
  },
  noTicketsText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 180,
    height: 180,
  },
});
