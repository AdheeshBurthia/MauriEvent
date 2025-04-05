import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import Wallet from "../screens/Wallet";
import TopupScreen from "../screens/TopupScreen";
import AddNewCard from "../screens/AddNewCard";
import NotificationScreen from "../screens/NotificationScreen";
import SecurityScreen from "../screens/SecurityScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import ContactSupportScreen from "../screens/ContactSupportScreen";
import UpdateCategories from "../screens/UpdateCategories";

const Stack = createNativeStackNavigator();

const TicketNavigator = (props) => {
  return (
    <Stack.Navigator initialRouteName="ProfileScreen">
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Topup"
        component={TopupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewCard"
        component={AddNewCard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateCategories"
        component={UpdateCategories}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
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
