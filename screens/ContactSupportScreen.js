import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontFamily from "../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import MapView, { Marker } from "react-native-maps";

const ContactSupportScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Contact Support</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.smallMap}
          initialRegion={{
            latitude: -20.18405,
            longitude: 57.723165,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          <Marker
            coordinate={{
              latitude: -20.18405,
              longitude: 57.723165,
            }}
            title="Location"
            description="Pave Road Petit Raffray"
          />
        </MapView>
      </View>

      <View style={styles.supportInfo}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Ionicons name="location-outline" size={20} color={Colours.primary} />
          <Text style={styles.contactText}>
            Address: Pave Road Petit Raffray
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={20} color={Colours.primary} />
          <Text style={styles.contactText}>
            Email: adheeshburthia1234@gmail.com
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={20} color={Colours.primary} />
          <Text style={styles.contactText}>Phone: 57959260</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="calendar-outline" size={20} color={Colours.primary} />
          <Text style={styles.contactText}>Working Days: Monday to Friday</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 16,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  mapContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  smallMap: {
    width: "100%",
    height: 300,
  },
  supportInfo: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
});

export default ContactSupportScreen;
