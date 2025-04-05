import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Colours from "../../constants/Colours";
import FontFamily from "../../constants/Fonts";
import Logo from "../../assets/logo.png";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Badge, Switch } from "react-native-paper";
import DefaultImage from "../../assets/placeholder.png";
import LoadingScreen from "../LoadingScreen";

const ProfileScreen = ({ navigation }) => {
  const { userData, userImage, userNotifications, logout } =
    useContext(AuthContext);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

  const handleEditProfilePress = () => {
    navigation.navigate("EditProfile");
  };

  const handleWalletPress = () => {
    navigation.navigate("Wallet");
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              logout();
            } catch (error) {
              setIsModalError(true);
              console.log(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handleAddSecurity = () => {
    navigation.navigate("Security");
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate("PrivacyPolicy");
  };

  const handleContactSupport = () => {
    navigation.navigate("ContactSupport");
  };

  // If user data is not available, show loading screen
  if (!userData) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving user profile..."
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifications}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={22} color="black" />
            {userNotifications?.unReadCount > 0 && (
              <Badge size={6} style={styles.badge}></Badge>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <View style={styles.profile}>
            {userImage ? (
              <Avatar.Image size={110} source={{ uri: userImage }} />
            ) : (
              <Avatar.Image size={110} source={DefaultImage} />
            )}
          </View>
          <Text style={styles.name}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        <View style={styles.settings}>
          <TouchableOpacity
            style={styles.tabContainer}
            onPress={handleEditProfilePress}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="settings-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Edit Profile</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity>
          {/* Wallet */}
          <TouchableOpacity
            style={styles.tabContainer}
            onPress={handleWalletPress}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="wallet-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Wallet</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity>
          <View style={{ ...styles.tabContainer, paddingVertical: 8 }}>
            <View style={styles.leftTab}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Notifications</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={handleNotificationToggle}
              color={Colours.primary}
            />
          </View>
          {/* <TouchableOpacity
            style={styles.tabContainer}
            onPress={handleAddSecurity}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Security</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.tabContainer}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Privacy Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabContainer}
            onPress={handleContactSupport}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={Colours.primary}
              />
              <Text style={styles.tabText}>Contact Support</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabContainer}
            onPress={handleLogoutPress}
          >
            <View style={styles.leftTab}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={Colours.danger}
              />
              <Text style={{ ...styles.tabText, color: Colours.danger }}>
                Logout
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colours.iconLight}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  header: {
    paddingTop: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifications: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  logo: {
    width: 70,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 5,
    borderRadius: 100,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontFamily: FontFamily.medium,
    marginTop: 17,
  },
  email: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: Colours.primary,
    marginTop: 6,
  },
  settings: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 17,
    marginBottom: 10,
  },
  leftTab: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    marginLeft: 12,
    marginBottom: 2,
  },
});
