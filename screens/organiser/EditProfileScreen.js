import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  TextInput,
  Keyboard,
  Modal,
} from "react-native";
import Colours from "../../constants/Colours";
import { Avatar, Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import FontFamily from "../../constants/Fonts";
import { StatusBar } from "expo-status-bar";
import { AuthContext } from "../../context/AuthContext";
import DefaultImage from "../../assets/placeholder.png";
import Icon from "react-native-vector-icons/FontAwesome";
import ErrorMessage from "../../components/ErrorMessage";
import ButtonGradient from "../../components/ButtonGradient";
import SuccessMessage from "../../components/SuccessMessage";
import * as ImagePicker from "expo-image-picker";
import LoadingScreen from "../LoadingScreen";
import Camera from "../../components/Camera";

const EditProfileScreen = ({ navigation }) => {
  const { userData, updateProfile, deleteProfilePicture } =
    useContext(AuthContext);
  const [oldUsername, setOldUsername] = useState(userData.username);
  const [newUsername, setNewUsername] = useState(oldUsername);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oldImage, setOldImage] = useState(userData.profileURL);
  const [newImage, setNewImage] = useState(oldImage);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const usernameLabelPosition = useRef(
    new Animated.Value(newUsername ? -16 : 16)
  ).current;

  const handleUsernameFocus = () => {
    setIsUsernameFocused(true);
    Animated.timing(usernameLabelPosition, {
      toValue: -16,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleUsernameBlur = () => {
    if (!newUsername) {
      setIsUsernameFocused(false);
      Animated.timing(usernameLabelPosition, {
        toValue: 16,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const validateUsername = (username) => {
    setUsernameError(false);
    setError("");
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) return false;

    const usernameRegex = /^[A-Za-z]+(?:[ _-][A-Za-z]+)*$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameError(true);
      setError("Username must contain only letters.");
      return true;
    }
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      setUsernameError(true);
      return true;
    }
    if (trimmedUsername.length > 10) {
      setUsernameError(true);
      setError("Username must be at most 10 characters long.");
      return true;
    }
    return false;
  };

  const handleUsername = (username) => {
    setNewUsername(username);
    validateUsername(username);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const url = result.assets[0].uri;
      setNewImage(url);
    }
  };

  // Function to handle saving changes
  const handleSave = async () => {
    Keyboard.dismiss();

    const usernameError = validateUsername(newUsername);
    if (usernameError) {
      setError(usernameError);
      setSuccess("");
      return;
    }

    if (newUsername === oldUsername && newImage === oldImage) {
      setError("No changes to update.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      let response;
      if (newImage === oldImage) {
        response = await updateProfile(newUsername, null);
      } else {
        response = await updateProfile(newUsername, newImage);
      }

      if (response) {
        setSuccess("Profile updated successfully!");
        setOldUsername(newUsername);
        setOldImage(newImage);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.log("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove profile picture
  const removeProfile = async () => {
    if (oldImage !== newImage) {
      setNewImage(oldImage);
      setModalVisible(false);
      return;
    }

    try {
      setLoading(true);
      const response = await deleteProfilePicture();
      if (response) {
        setOldImage(null);
        setNewImage(null);
        setModalVisible(false);
        setSuccess("Image removed successfully!");
      }
    } catch (error) {
      setSuccess("");
      setError("Failed to remove profile picture. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPress = () => {
    setShowCamera(true);
    setModalVisible(false);
    setError("");
    setSuccess("");
  };

  // If user data is not available, show loading screen
  if (!userData) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Retrieving user profile..."
      />
    );
  }

  if (loading) {
    return (
      <LoadingScreen
        defaultText="Searching for connection"
        loadingText="Updating user profile..."
      />
    );
  }

  if (showCamera) {
    return <Camera setImage={setNewImage} setShowCamera={setShowCamera} />;
  }

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
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profile}>
          {newImage ? (
            <Avatar.Image size={110} source={{ uri: newImage }} />
          ) : (
            <Avatar.Image size={110} source={DefaultImage} />
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
            setError("");
          }}
        >
          <Text style={styles.editProfile}>Edit Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View
          style={[
            styles.inputContainer,
            isUsernameFocused && styles.inputContainerFocused,
            usernameError && styles.errorInputContainer,
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder=""
            value={newUsername}
            onChangeText={handleUsername}
            onFocus={handleUsernameFocus}
            onBlur={handleUsernameBlur}
          />
          <Icon
            name="user"
            size={20}
            color={
              usernameError
                ? Colours.danger
                : isUsernameFocused
                ? Colours.primary
                : Colours.iconLight
            }
            style={styles.icon}
          />
        </View>
        <View style={[styles.inputContainer]}>
          <TextInput
            style={styles.input}
            placeholder=""
            value={userData.email}
            autoCapitalize="none"
            editable={false}
          />
          <Icon
            name="envelope"
            size={20}
            color={Colours.iconLight}
            style={styles.icon}
          />
        </View>
      </View>
      {error ? <ErrorMessage error={error} /> : null}
      {success ? <SuccessMessage success={success} /> : null}
      <View style={styles.buttonContainer}>
        <ButtonGradient
          authHandler={handleSave}
          loading={isLoading}
          text="Update"
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
        onBlur={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select an option</Text>

            <View style={styles.modalView}>
              <TouchableOpacity
                onPress={handleCameraPress}
                style={styles.modalButton}
              >
                <Ionicons
                  name="camera-outline"
                  size={30}
                  color={Colours.accent2}
                />
                <Text style={styles.iconText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  pickImage();
                  setModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Ionicons
                  name="image-outline"
                  size={30}
                  color={Colours.accent2}
                />
                <Text style={styles.iconText}>Gallery</Text>
              </TouchableOpacity>

              {/* Remove */}
              {newImage ? (
                <TouchableOpacity
                  onPress={removeProfile}
                  style={styles.modalButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={30}
                    color={Colours.danger}
                  />
                  <Text style={styles.iconText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.modalButton}>
                  <Ionicons
                    name="trash-outline"
                    size={30}
                    color={Colours.iconBottom}
                  />
                  <Text style={styles.grayOut}>Remove</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
};

export default EditProfileScreen;

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
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 5,
    borderRadius: 100,
    elevation: 5,
  },
  editProfile: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    marginTop: 17,
    color: Colours.primary,
  },

  form: {
    marginTop: 35,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 15,
    paddingHorizontal: 18,
    borderColor: Colours.outline,
    borderWidth: 1,
  },
  inputContainerFocused: {
    borderColor: Colours.primary,
    borderWidth: 1,
  },
  label: {
    position: "absolute",
    left: 18,
    fontSize: 16,
    color: Colours.extraLightText,
    fontFamily: FontFamily.regular,
  },
  labelFocused: {
    top: -16,
    fontSize: 12,
    color: Colours.primary,
    padding: 5,
    backgroundColor: Colours.mediumBackground,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: Colours.mediumText,
    fontFamily: FontFamily.regular,
  },
  icon: {
    paddingVertical: 15,
  },
  errorInputContainer: {
    borderColor: Colours.danger,
    borderWidth: 1,
  },
  errorLabel: {
    color: Colours.danger,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "flex-end",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContainer: {
    width: 330,
    backgroundColor: "white",
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalView: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 305,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    marginVertical: 20,
    color: Colours.mediumText,
  },
  modalButton: {
    alignItems: "center",
    backgroundColor: Colours.mediumBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 28,
  },
  iconText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colours.mediumText,
  },
  grayOut: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    color: Colours.mediumText,
  },
  image: {
    width: 40,
    height: "100%",
  },
});
