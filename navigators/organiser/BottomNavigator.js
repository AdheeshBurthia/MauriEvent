import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import Colours from "../../constants/Colours";
import FontFamily from "../../constants/Fonts";
import HomeScreen from "../../navigators/organiser/HomeNavigator";
import EventScreen from "../../navigators/organiser/EventNavigator";
import ScannerScreen from "../../screens/organiser/ScannerScreen";
import GalleryNavigator from "./GalleryNavigator";
import ProfileScreen from "../../navigators/organiser/ProfileNavigator";

const Tab = createBottomTabNavigator();

const BottomNavigator = (props) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home-variant" : "home-variant-outline";
          } else if (route.name === "Events") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Scanner") {
            iconName = focused ? "qrcode-scan" : "line-scan";
          } else if (route.name === "Gallery") {
            iconName = focused ? "image" : "image-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "account-circle" : "account-circle-outline";
          }

          // You can return any component that you like here!
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: Colours.primary,
        tabBarInactiveTintColor: Colours.iconBottom,
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Gallery" component={GalleryNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({});
