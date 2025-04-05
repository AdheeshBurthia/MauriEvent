import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GalleryScreen from "../screens/GalleryScreen";
import VideoPlayer from "../screens/VideoPlayer";
import NotificationScreen from "../screens/NotificationScreen";

const Stack = createNativeStackNavigator();

const GalleryNavigator = (props) => {
  return (
    <Stack.Navigator initialRouteName="GalleryScreen">
      <Stack.Screen
        name="GalleryScreen"
        component={GalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
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

export default GalleryNavigator;

const styles = StyleSheet.create({});
