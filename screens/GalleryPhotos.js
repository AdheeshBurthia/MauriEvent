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
import { AuthContext } from "../context/AuthContext";

const GalleryPhotos = (props) => {
  const { media } = useContext(AuthContext);
  const [visible, setIsVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth / 3 - 2;

  // Filter images from userData.media
  const images = media
    .filter((media) => media.mediaType === "image")
    .map((media) => ({ uri: media.mediaURL, mediaName: media.mediaName }));

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setIsVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      style={styles.imageBackground}
    >
      <Image
        source={{ uri: item.uri }}
        style={[
          styles.image,
          { width: imageWidth - 10, height: imageWidth - 10 },
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
      <ImageView
        images={images}
        imageIndex={selectedImageIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        presentationStyle="overFullScreen"
        animationType="fade"
        FooterComponent={({ imageIndex }) => (
          <Text style={styles.imageFooter}>
            {imageIndex + 1} / {images.length}
          </Text>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
};

export default GalleryPhotos;

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
});
