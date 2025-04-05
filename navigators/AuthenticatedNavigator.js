import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomNavigator from "../navigators/BottomNavigator";
import ChooseCategoryScreen from "../screens/ChooseCategoryScreen";

const Stack = createNativeStackNavigator();

const AuthenticatedNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChooseCategory"
        component={ChooseCategoryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EventHome"
        component={BottomNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedNavigator;

const styles = StyleSheet.create({});
