import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Colours from "../constants/Colours";
import HomeScreen from "../navigators/HomeNavigator";
import FavouriteScreen from "../navigators/FavouriteNavigator";
import TicketScreen from "../navigators/TicketNavigator";
import GalleryScreen from "../navigators/GalleryNavigator";
import ProfileScreen from "../navigators/ProfileNavigator";
import FontFamily from "../constants/Fonts";

const Tab = createBottomTabNavigator();

const BottomNavigator = (props) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Favourites") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Tickets") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "Gallery") {
            iconName = focused ? "images" : "images-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colours.primary,
        tabBarInactiveTintColor: Colours.iconBottom,
        headerShown: false,
        unmountOnBlur: true,
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favourites" component={FavouriteScreen} />
      <Tab.Screen name="Tickets" component={TicketScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({});
