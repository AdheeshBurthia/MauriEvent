import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import EventCardLarge from "./EventCardLarge";
import { AuthContext } from "../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import SkeletonLarge from "./SkeletonLarge";
import LoadingScreen from "../screens/LoadingScreen";

const LatestEvent = ({ navigation }) => {
  const [sortedEvents, setSortedEvents] = useState([]);
  const { userData, homeLoaded, setHomeLoaded } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (homeLoaded) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setHomeLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [homeLoaded]);

  useEffect(() => {
    if (userData && userData.userEvents) {
      sortEventsByDatetime();
    }
  }, [userData]);

  const sortEventsByDatetime = () => {
    const today = new Date(); // Get today's date
    const filteredAndSorted = [...userData.userEvents]
      .filter((event) => {
        const eventDate =
          event.datetime instanceof Timestamp
            ? event.datetime.toDate()
            : event.datetime;
        return eventDate >= today; // Filter events from today to future
      })
      .sort((a, b) => {
        const datetimeA =
          a.datetime instanceof Timestamp ? a.datetime.toDate() : a.datetime;
        const datetimeB =
          b.datetime instanceof Timestamp ? b.datetime.toDate() : b.datetime;
        return datetimeA - datetimeB; // Sort in ascending order
      });

    setSortedEvents(filteredAndSorted);
  };

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
        <Text style={styles.title}>Latest Event</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AllEventScreen", {
              allEvents: sortedEvents,
              title: "All Latest Event",
            });
          }}
          style={styles.allEvent}
        >
          <Text style={styles.all}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardContainer}
      >
        {isLoading ? (
          <>
            <SkeletonLarge />
            <SkeletonLarge />
            <SkeletonLarge />
            <SkeletonLarge />
          </>
        ) : (
          sortedEvents.slice(0, 4).map((event, index) => {
            const formattedDateTime = formatDateTime(event.datetime);
            return (
              <EventCardLarge
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
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default LatestEvent;

const styles = StyleSheet.create({
  container: {
    paddingTop: 13,
  },
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
    paddingTop: 9,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingRight: 0,
    justifyContent: "center",
  },
});
