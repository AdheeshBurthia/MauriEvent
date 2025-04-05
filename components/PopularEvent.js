import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import EventCardList from "./EventCardList";
import { AuthContext } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import LoadingScreen from "../screens/LoadingScreen";

const PopularEvent = ({ navigation }) => {
  const { userData } = useContext(AuthContext);

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

  let filteredEvents = userData.userEvents;

  // Get today's date
  const today = new Date();

  // Filter out past events
  filteredEvents = filteredEvents.filter((event) => {
    const eventDate =
      event.datetime instanceof Timestamp
        ? event.datetime.toDate()
        : event.datetime;
    return eventDate >= today;
  });

  // Sort events by number of people attending in descending order
  filteredEvents.sort((a, b) => b.attending - a.attending);

  if (!userData.userEvents)
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving user events..."
      />
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Event 🔥</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AllEventScreen", {
              allEvents: filteredEvents,
              title: "All Popular Event 🔥",
            });
          }}
          style={styles.allEvent}
        >
          <Text style={styles.all}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        {filteredEvents.slice(0, 3).map((event, index) => {
          const formattedDateTime = formatDateTime(event.datetime);
          return (
            <EventCardList
              key={index}
              id={event.id}
              category={event.category}
              image={event.image}
              text={event.name}
              date={formattedDateTime}
              location={event.location}
              coordinates={event.coordinates}
              navigation={navigation}
              attending={event.attending}
              organiserId={event.organiserId}
              organiserUsername={event.organiserUsername}
              organiserEmail={event.organiserEmail}
              organiserProfileURL={event.organiserProfileURL}
              max_attendees={event.max_attendees}
              details={event.details}
              isLiked={event.isLiked}
              isBooked={event.isBooked}
              price={event.price}
              screen="Events"
            />
          );
        })}
      </View>
    </View>
  );
};

export default PopularEvent;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingLeft: 16,
  },
  allEvent: {
    paddingVertical: 10,
  },
  all: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    paddingRight: 16,
    color: Colours.primary,
  },
  cardContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
});
