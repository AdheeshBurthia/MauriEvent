import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import Colours from "../../constants/Colours";
import { AuthContext } from "../../context/AuthContext";
import ModalSuccess from "../../components/ModalSuccess";
import ModalError from "../../components/ModalError";
import LoadingScreen from "../LoadingScreen";

const GalleryVideos = () => {
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth / 3 - 2;
  const { userData, deleteMedia } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [isModalError, setIsModalError] = useState(false);

  const videos = userData.media
    .filter((media) => media.mediaType === "video")
    .map((media) => ({ uri: media.mediaURL, mediaName: media.mediaName }));

  const handleImagePress = (index) => {
    navigation.navigate("VideoPlayer", {
      videoURL: videos[index].uri,
    });
  };

  const handleLongPressStart = (index) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this video?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => handleLongPress(index),
        },
      ],
      { cancelable: false }
    );
  };

  const handleLongPress = async (index) => {
    setLoading(true);
    try {
      await deleteMedia("video", videos[index].mediaName);
      setModalSuccess(true);
    } catch (error) {
      setIsModalError(true);
      console.log(error);
    }
    setLoading(false);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      onLongPress={() => handleLongPressStart(index)}
      style={styles.imageContainer}
    >
      <Image
        source={{
          uri: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600",
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

  if (loading || !userData.media)
    return (
      <LoadingScreen
        defaultText="Loading Video..."
        loadingText="Please wait while we process your video"
      />
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addContainer}>
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
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
      {modalSuccess && (
        <ModalSuccess
          visible={modalSuccess}
          onClose={() => setModalSuccess(false)}
          title="Successful!"
          message="Video deleted successfully!"
        />
      )}

      {isModalError && (
        <ModalError
          visible={isModalError}
          onClose={() => setIsModalError(false)}
          title="Oops, Error!"
          message="Failed to delete video. Please try again."
        />
      )}
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
});
