import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import Colours from "../constants/Colours";
import Logo from "../assets/logo.png";
import DefaultImage from "../assets/placeholder.png";
import { Avatar, Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import FontFamily from "../constants/Fonts";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const HeaderContainer = ({ userProfile, navigation }) => {
  const { userNotifications } = useContext(AuthContext);
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.mauriEvent}>MauriEvent</Text>
        </View>
        <View style={styles.profile}>
          <TouchableOpacity
            style={styles.notifications}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
            {userNotifications?.unReadCount > 0 && (
              <Badge size={6} style={styles.badge}></Badge>
            )}
          </TouchableOpacity>
          {userProfile ? (
            <Avatar.Image size={40} source={{ uri: userProfile }} />
          ) : (
            <Avatar.Image size={40} source={DefaultImage} />
          )}
        </View>
      </View>
      <StatusBar style="light" />
    </View>
  );
};

export default HeaderContainer;

const styles = StyleSheet.create({
  headerContainer: {
    position: "fixed",
    paddingTop: 12,
    paddingBottom: 15,
    backgroundColor: Colours.darkerBackground,
  },
  header: {
    paddingLeft: 4,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    backgroundColor: Colours.darkerBackground,
    width: 70,
    height: 30,
  },
  mauriEvent: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    color: "white",
    marginBottom: 2,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifications: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});
