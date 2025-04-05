import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";
import FontFamily from "../constants/Fonts";
import ButtonGradient from "../components/ButtonGradient";
import { FontAwesome } from "@expo/vector-icons";
import Colours from "../constants/Colours";
import ModalError from "../components/ModalError";

const ChooseCategoryScreen = ({ navigation }) => {
  const {
    userData,
    userId,
    getAllCategories,
    updateUserCategories,
    getEventsForUser,
    logout,
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [eventCategories, setEventCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [updatingCategories, setUpdatingCategories] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");
  const [categories, setCategories] = useState(userData.categories);

  useEffect(() => {
    let isMounted = true; // Add a flag to check if the component is still mounted

    const fetchData = async () => {
      setLoading(true);

      try {
        if (categories.length > 0) {
          // Fetch user events if user has categories
          await fetchUserEvents();
          if (isMounted) {
            navigation.replace("EventHome");
          }
        } else {
          // Fetch all categories if user has no categories
          const response = await getAllCategories();
          if (isMounted) {
            setEventCategories(response);
            console.log("Fetched all categories");
          }
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Clean up function to set the flag to false
    };
  }, [categories]);

  const fetchUserEvents = async () => {
    try {
      await getEventsForUser(userData.categories);
      console.log("Fetched events completed");
    } catch (error) {
      console.error("Error fetching events for user:", error);
      setErrorMessages("Error updating your events. Please try again.");
      setIsModalVisible(true);
      logout();
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prevSelectedCategories) => {
      const index = prevSelectedCategories.findIndex(
        (cat) => cat.id === category.id
      );
      if (index === -1) {
        return [...prevSelectedCategories, category];
      } else {
        const newSelectedCategories = [...prevSelectedCategories];
        newSelectedCategories.splice(index, 1);
        return newSelectedCategories;
      }
    });
  };

  const isCategorySelected = (category) => {
    return selectedCategories.some((cat) => cat.id === category.id);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCategorySelect(item)}
      style={[
        styles.categoryItem,
        isCategorySelected(item) && styles.selectedCategory,
      ]}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.imageBackground}
      >
        {isCategorySelected(item) && (
          <FontAwesome
            name="check-circle"
            size={24}
            color="#fff"
            style={styles.tickIcon}
          />
        )}
        <View style={styles.overlay}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const handleConfirm = async () => {
    setErrorMessages("");
    if (selectedCategories.length >= 3) {
      setUpdatingCategories(true);
      const categories = selectedCategories.map((category) => category.name);
      try {
        await updateUserCategories(userId, categories);
        setCategories(categories);
      } catch (error) {
        console.log("Error updating user categories:", error);
        setErrorMessages("Error updating your categories. Please try again.");
        setIsModalVisible(true);
      } finally {
        setUpdatingCategories(false);
      }
    } else {
      // Notify user to select at least three categories
      setErrorMessages("Please select at least three categories to proceed.");
      setIsModalVisible(true);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        defaultText="Loading user data..."
        loadingText="Loading user data..."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>What are you interested in?</Text>
      <Text style={styles.subHeader}>
        Please select three or more to proceed.
      </Text>

      <FlatList
        data={eventCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.categoryContainer}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.buttonContainer}>
        <ButtonGradient
          authHandler={handleConfirm}
          loading={updatingCategories}
          text="Confirm"
          style={styles.button}
        />
      </View>

      <ModalError
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        title="Oops, Error!"
        message={errorMessages}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.background,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: FontFamily.bold,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: FontFamily.regular,
  },
  categoryContainer: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    height: 150,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#ffffff",
    overflow: "hidden",
  },
  selectedCategory: {
    borderWidth: 3,
    borderColor: "#000",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.286)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ffffff",
    borderWidth: 3,
    borderRadius: 17,
  },
  categoryName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: FontFamily.bold,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: -24,
  },
  tickIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default ChooseCategoryScreen;
