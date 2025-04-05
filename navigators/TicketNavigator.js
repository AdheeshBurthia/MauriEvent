import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TicketScreen from "../screens/TicketScreen";
import TicketDetails from "../screens/EventDetailsScreen";
import ViewTicketScreen from "../screens/ViewTicketScreen";
import NotificationScreen from "../screens/NotificationScreen";

const Stack = createNativeStackNavigator();

const TicketNavigator = (props) => {
  return (
    <Stack.Navigator initialRouteName="TicketScreen">
      <Stack.Screen
        name="TicketScreen"
        component={TicketScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketDetails"
        component={TicketDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewTicket"
        component={ViewTicketScreen}
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

export default TicketNavigator;

const styles = StyleSheet.create({});
