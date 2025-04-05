import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ImageView from "react-native-image-viewing";
import Logo from "../assets/logo.png";
import FontFamily from "../constants/Fonts";
import Colours from "../constants/Colours";
import { TabView, SceneMap } from "react-native-tab-view";

const GalleryScreen = (props) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth / 3 - 2;

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const openImage = (index) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const renderImage = ({ item, index }) => (
    <TouchableOpacity onPress={() => openImage(index)}>
      <Image
        source={{ uri: item }}
        style={[styles.image, { width: imageWidth, height: imageWidth }]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.title}>Gallery</Text>
        </View>
      </View>
      {selectedImages.length === 0 ? (
        <Text>No images selected</Text>
      ) : (
        <FlatList
          data={selectedImages}
          renderItem={renderImage}
          keyExtractor={(item) => item}
          numColumns={3}
        />
      )}

      <Button title="Choose a photo" onPress={pickImageAsync} />

      <ImageView
        images={selectedImages.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        presentationStyle="overFullScreen"
        FooterComponent={({ imageIndex }) => (
          <Text style={{ color: "white" }}>
            {imageIndex + 1} / {selectedImages.length}
          </Text>
        )}
        animationType="fade"
      />
      <StatusBar style="auto" />
    </View>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.mediumBackground,
  },
  headerContainer: {
    backgroundColor: "white",
    elevation: 2,
    zIndex: 1,
  },
  header: {
    paddingTop: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  logo: {
    width: 70,
    height: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    paddingBottom: 2,
  },
  image: {
    margin: 1,
  },
});
