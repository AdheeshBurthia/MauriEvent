import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

const VideoPlayer = ({ navigation, route }) => {
  const video = useRef(null);
  const [status, setStatus] = useState({});

  const { videoURL } = route.params;

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: videoURL,
        }}
        useNativeControls
        resizeMode="contain"
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 35,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
