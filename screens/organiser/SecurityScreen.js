import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import FontFamily from "../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../../constants/Colours";
const { width, height } = Dimensions.get("window");

const dialPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"];
const dialPadSize = width * 0.2;
const pinLength = 6;

const SecurityScreen = ({ navigation }) => {
  const [pinCode, setPinCode] = useState([]);

  const DialPad = ({ onPress }) => {
    return (
      <View style={{ height: 420 }}>
        <FlatList
          data={dialPad}
          numColumns={3}
          style={{ flexGrow: 1 }}
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={false}
          columnWrapperStyle={{ gap: 30 }}
          contentContainerStyle={{ gap: 30 }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => onPress(item)}
                disabled={item === ""}
              >
                <View
                  style={{
                    width: dialPadSize,
                    height: dialPadSize,
                    borderRadius: dialPadSize / 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item === "del" ? (
                    <Ionicons
                      name="backspace-outline"
                      size={dialPadSize / 2}
                      color="black"
                    />
                  ) : item === "" ? (
                    <Ionicons
                      name="finger-print"
                      size={dialPadSize / 2}
                      color="black"
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: dialPadSize / 2,
                        color: "black",
                      }}
                    >
                      {item}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colours.extraLightText}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 42,
            color: "black",
          }}
        >
          Add Passcode
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            marginBottom: 40,
            height: 30,
            alignItems: "fex-end",
          }}
        >
          {[...Array(pinLength).keys()].map((index) => {
            const isSelected = !!pinCode[index];

            return (
              <View
                key={index}
                style={{
                  width: 22,
                  height: isSelected ? 22 : 2,
                  borderRadius: 22,
                  backgroundColor: "black",
                }}
              />
            );
          })}
        </View>
        <DialPad
          onPress={(item) => {
            if (item === "del") {
              setPinCode((prevCode) => prevCode.slice(0, prevCode.length - 1));
            } else if (typeof item === "number") {
              setPinCode((prevCode) => [...prevCode, item]);
            }
          }}
        />
      </View>
    </View>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginHorizontal: 16,
  },
  goBack: {
    marginRight: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
});
