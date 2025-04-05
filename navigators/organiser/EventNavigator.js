import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EventScreen from "../../screens/organiser/EventScreen";
import EventDetailsScreen from "../../screens/organiser/EventDetailsScreen";
import AddEventScreen from "../../screens/organiser/AddEventScreen";
import EditEventScreen from "../../screens/organiser/EditEventScreen";
import NotificationScreen from "../../screens/NotificationScreen";

const Stack = createNativeStackNavigator();

const EventNavigator = (props) => {
  return (
    <Stack.Navigator initialRouteName="EventScreen">
      <Stack.Screen
        name="EventScreen"
        component={EventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEvent"
        component={AddEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditEvent"
        component={EditEventScreen}
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

export default EventNavigator;

const styles = StyleSheet.create({});
