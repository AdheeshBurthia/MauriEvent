import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FavouriteScreen from "../screens/FavouriteScreen";
import FavouriteDetails from "../screens/EventDetailsScreen";
import NotificationScreen from "../screens/NotificationScreen";

const Stack = createNativeStackNavigator();

const FavouriteNavigator = (props) => {
  return (
    <Stack.Navigator initialRouteName="FavouriteScreen">
      <Stack.Screen
        name="FavouriteScreen"
        component={FavouriteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FavouriteDetails"
        component={FavouriteDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default FavouriteNavigator;

const styles = StyleSheet.create({});
