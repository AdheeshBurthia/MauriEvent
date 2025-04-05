import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import EventCardSmall from "./EventCardSmall";
import { Timestamp } from "firebase/firestore";

const FilterCardSmall = ({ navigation, latestEvents, screen }) => {
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
  const renderEventCard = ({ item }) => {
    const formattedDateTime = formatDateTime(item.datetime);
    return (
      <EventCardSmall
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
        isLiked={item.isLiked}
        isBooked={item.isBooked}
        screen={screen}
        navigation={navigation}
        price={item.price}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={latestEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.cardList}
      />
    </View>
  );
};

export default FilterCardSmall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardList: {
    paddingTop: 16,
    paddingBottom: 2,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
  },
});
