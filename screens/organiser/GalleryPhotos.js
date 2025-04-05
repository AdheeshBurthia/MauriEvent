import React, { useContext, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableNativeFeedback,
  Dimensions,
  Text,
  Alert,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { StatusBar } from "expo-status-bar";
import Colours from "../../constants/Colours";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AuthContext } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import ModalSuccess from "../../components/ModalSuccess";
import ModalError from "../../components/ModalError";
import LoadingScreen from "../../screens/LoadingScreen";

const GalleryPhotos = (props) => {
  const { userData, addMedia, deleteMedia } = useContext(AuthContext);
  const [visible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [isModalError, setIsModalError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const longPressTimeout = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth / 3 - 2;

  // Filter images from userData.media
  const images = userData.media
    .filter((media) => media.mediaType === "image")
    .map((media) => ({ uri: media.mediaURL, mediaName: media.mediaName }));

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setIsVisible(true);
  };

  const handleLongPressStart = (index) => {
    longPressTimeout.current = setTimeout(() => {
      handleLongPress(index);
    }, 500); // Adjust the duration as needed (1000ms = 1 second)
  };

  const handleLongPress = (index) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setLoading(true);
            try {
              deleteMedia("image", images[index].mediaName);
              setModalSuccess(true);
            } catch (error) {
              setIsModalError(true);
              console.log(error);
            }
            setLoading(false);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const url = result.assets[0].uri;
      setLoading(true);
      try {
        const response = await addMedia(url);
        if (response) {
          setModalSuccess(true);
        }
      } catch (error) {
        setIsModalError(true);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderTouchableComponent = (children, onPress, onLongPress, key) => {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        background={TouchableNativeFeedback.Ripple(Colours.primary, false)}
        key={key}
      >
        {children}
      </TouchableNativeFeedback>
    );
  };

  const renderItem = ({ item, index }) => {
    const TouchableComponent = renderTouchableComponent(
      <View style={styles.imageBackground}>
        <Image
          source={{ uri: item.uri }}
          style={[
            styles.image,
            { width: imageWidth - 10, height: imageWidth - 10 },
          ]}
        />
      </View>,
      () => handleImagePress(index),
      () => handleLongPressStart(index),
      index.toString()
    );

    return TouchableComponent;
  };

  if (loading || !userData.media)
    return (
      <LoadingScreen
        defaultText="Loading Image..."
        loadingText="Please wait while we process your image"
      />
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addContainer} onPress={pickImage}>
        <View style={styles.addIconContainer}>
          <Ionicons name="images" size={32} color={Colours.primary} />
          <FontAwesome6
            name="arrow-up"
            size={15}
            color={Colours.primary}
            style={styles.addIcon}
          />
        </View>
      </TouchableOpacity>
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
      {modalSuccess && (
        <ModalSuccess
          visible={modalSuccess}
          onClose={() => {
            setModalSuccess(false);
          }}
          title="Successful!"
          message="Image uploaded successfully!"
        />
      )}

      {isModalError && (
        <ModalError
          visible={isModalError}
          onClose={() => {
            setIsModalError(false);
          }}
          title="Oops, Error!"
          message="Failed to upload image. Please try again."
        />
      )}
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
  addContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  addIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "95%",
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colours.primary,
    borderStyle: "dashed",
    position: "relative",
  },
  addIcon: {
    position: "absolute",
    padding: 4,
    backgroundColor: "white",
    borderRadius: 50,
    top: 15,
    right: 140,
  },
  imageBackground: {
    backgroundColor: "transparent", // Ensure image background is transparent for TouchableNativeFeedback
  },
});
