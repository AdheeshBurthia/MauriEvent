import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthenticatedNavigator from "./AuthenticatedNavigator";
import AuthNavigator from "./AuthNavigator";
import { AuthContext } from "../context/AuthContext";
import Colours from "../constants/Colours";
import LoadingScreen from "../screens/LoadingScreen";
import { auth } from "../config/firebase";
import BottomNavigator from "./organiser/BottomNavigator";

const AppNavigator = () => {
  const { authenticate, isLoggedIn, getUserData, userData, logout } =
    useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["token", "userId"])
      .then(async (values) => {
        const token = values[0][1];
        const storedUserId = values[1][1];
        // console.log("Token: ", token);
        if (token && storedUserId) {
          const listen = auth.onAuthStateChanged(async (user) => {
            if (user) {
              user
                .getIdTokenResult()
                .then(async (idTokenResult) => {
                  const userId = idTokenResult.claims.user_id;
                  // console.log("userId: ", userId);
                  if (userId === storedUserId) {
                    authenticate(token, true, userId);
                    console.log("User is authenticated");

                    await getUserData(userId);
                    setIsLoading(false);
                    console.log("Loading complete");
                  } else {
                    console.log("UserId mismatch or invalid");
                  }
                })
                .catch((error) => {
                  console.log("Error getting idTokenResult: ", error);
                });
            } else {
              console.log("User is not authenticated");
              logout();
            }
            listen();
          });
        } else {
          setIsLoading(false);
          console.log("Loading complete");
        }
      })
      .catch((error) => {
        console.log("Error getting token:", error);
      });
  }, []);

  // If loading, display loading screen
  if (isLoading) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving user data..."
      />
    );
  }

  // Once loading is done, render appropriate navigator based on login status
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        userData ? (
          userData.userType === "organiser" ? (
            <BottomNavigator />
          ) : (
            <AuthenticatedNavigator />
          )
        ) : (
          <LoadingScreen />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.background,
  },
  splash: {
    width: 420,
    height: 600,
  },
  logo: {
    width: 120,
    height: 80,
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
