import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../../screens/organiser/ProfileScreen";
import EditProfileScreen from "../../screens/organiser/EditProfileScreen";
import Wallet from "../../screens/organiser/Wallet";
import AddNewCard from "../../screens/AddNewCard";
import SecurityScreen from "../../screens/organiser/SecurityScreen";
import PrivacyPolicyScreen from "../../screens/PrivacyPolicyScreen";
import ContactSupportScreen from "../../screens/ContactSupportScreen";
import NotificationScreen from "../../screens/NotificationScreen";
import WithdrawScreen from "../../screens/organiser/WithdrawScreen";

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
        name="AddNewCard"
        component={AddNewCard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
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
