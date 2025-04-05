import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import ImageView from "react-native-image-viewing";
import Colours from "../constants/Colours";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const GalleryVideos = () => {
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth / 3 - 2;
  const { media } = useContext(AuthContext);

  const navigation = useNavigation();

  // Filter images from userData.media
  const videos = media
    .filter((media) => media.mediaType === "video")
    .map((media) => ({ uri: media.mediaURL, mediaName: media.mediaName }));

  const handleImagePress = (index) => {
    navigation.navigate("VideoPlayer", {
      videoURL: videos[index].uri,
    });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      style={styles.imageContainer}
    >
      <Image
        source={{
          uri: "https://images.pexels.com/photos/320617/pexels-photo-320617.jpeg?auto=compress&cs=tinysrgb&w=600",
        }}
        style={[
          styles.image,
          { width: imageWidth - 10, height: imageWidth - 10 },
        ]}
      />
      <View style={styles.imageOverlay}>
        <Ionicons name="play" size={30} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
      <StatusBar style="auto" />
    </View>
  );
};

export default GalleryVideos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  list: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  image: {
    margin: 4,
    borderRadius: 10,
  },
  imageFooter: {
    color: "white",
    margin: 20,
  },
  imageContainer: {
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.281)",
    borderRadius: 10,
    margin: 4,
  },
});
