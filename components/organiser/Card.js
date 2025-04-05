import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Card = ({ title, data, icon }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.data}>{data}</Text>
        </View>
        <Text style={styles.icon}>{icon}</Text>
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  data: {
    fontSize: 24,
    fontWeight: "bold",
  },
  icon: {
    fontSize: 30,
  },
});
