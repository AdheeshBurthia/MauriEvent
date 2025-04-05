import { useEffect, useState } from "react";
import { Text, StyleSheet, Image } from "react-native";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "../assets/logoShadow.png";
import Colours from "../constants/Colours";

const LoadingScreen = ({ defaultText, loadingText }) => {
  const [defaultLoadingText, setDefaultLoadingText] = useState(defaultText);

  // Change the loading text after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setDefaultLoadingText(loadingText);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <ProgressBar
        indeterminate={true}
        color={Colours.primary}
        style={styles.progressBar}
      />
      <Text style={styles.text}>{defaultLoadingText}</Text>
    </SafeAreaView>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.background,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: 20,
  },
  progressBar: {
    width: 100,
    backgroundColor: "white",
  },
  text: {
    fontSize: 16,
    marginTop: 20,
    color: Colours.primaryAlt,
  },
});
