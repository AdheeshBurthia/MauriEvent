import { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Raleway_100Thin,
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_700Bold,
  Raleway_900Black,
} from "@expo-google-fonts/raleway";
import {
  Rajdhani_500Medium,
  Rajdhani_700Bold,
} from "@expo-google-fonts/rajdhani";

import AppNavigator from "./navigators/AppNavigator";
import { AuthContextProvider } from "./context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_100Thin,
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_700Bold,
    Raleway_900Black,
    Rajdhani_500Medium,
    Rajdhani_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AuthContextProvider>
        <AppNavigator />
      </AuthContextProvider>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
