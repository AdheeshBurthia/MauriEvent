import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ToastAndroid,
} from "react-native";
import FontFamily from "../../constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import Colours from "../../constants/Colours";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import ButtonGradient from "../../components/ButtonGradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../context/AuthContext";

const AddEventScreen = ({ navigation }) => {
  const { addEvent, userId } = useContext(AuthContext);
  const [category, setCategory] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [image, setImage] = useState(null);
  const [eventLatitude, setEventLatitude] = useState("");
  const [eventLongitude, setEventLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleAddEvent = async () => {
    // Clear previous errors
    setErrors("");

    let formIsValid = true;

    // Basic validation checks
    if (eventName.trim() === "") {
      setErrors("Event name is required");
      formIsValid = false;
    }

    if (eventLocation.trim() === "") {
      setErrors("Event location is required");
      formIsValid = false;
    }

    if (isNaN(parseFloat(eventLatitude)) || isNaN(parseFloat(eventLongitude))) {
      setErrors("Latitude and longitude must be valid numbers");
      formIsValid = false;
    }

    if (formIsValid) {
      setLoading(true);

      const newEvent = {
        category,
        image,
        name: eventName,
        date: eventDate,
        location: eventLocation,
        max_attendees: parseInt(maxAttendees),
        price: parseFloat(eventPrice),
        latitude: parseFloat(eventLatitude),
        longitude: parseFloat(eventLongitude),
      };

      try {
        const response = await addEvent(userId, newEvent);
        if (response) {
          ToastAndroid.show("Event added successfully", ToastAndroid.SHORT);
          navigation.goBack();
        }
      } catch (error) {
        console.log("Error adding event", error);
        ToastAndroid.show("Error adding event", ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    }
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
        <Text style={styles.title}>Add New Event</Text>
      </View>

      <ScrollView>
        <View style={styles.form}>
          <TouchableOpacity style={styles.addContainer} onPress={pickImage}>
            {image ? (
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
            ) : (
              <View style={styles.addIconContainer}>
                <Text style={styles.imagePickerText}>Add Event Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.label}>Select Category</Text>
          <Picker
            selectedValue={category}
            style={styles.input}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            <Picker.Item label="Select a category" value="" />
            <Picker.Item label="Music" value="music" />
            <Picker.Item label="Sports" value="sports" />
            <Picker.Item label="Art" value="art" />
            <Picker.Item label="Technology" value="technology" />
            <Picker.Item label="Concert" value="concert" />
          </Picker>

          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Enter event name"
          />

          <Text style={styles.label}>Event Date</Text>
          <TextInput
            style={styles.input}
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="Enter event date"
          />

          <Text style={styles.label}>Event Location</Text>
          <TextInput
            style={styles.input}
            value={eventLocation}
            onChangeText={setEventLocation}
            placeholder="Enter event location"
          />

          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={eventLatitude}
            onChangeText={setEventLatitude}
            placeholder="Enter latitude"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={eventLongitude}
            onChangeText={setEventLongitude}
            placeholder="Enter longitude"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Max Attendees</Text>
          <TextInput
            style={styles.input}
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            placeholder="Enter max attendees"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Event Price</Text>
          <TextInput
            style={styles.input}
            value={eventPrice}
            onChangeText={setEventPrice}
            placeholder="Enter event price"
            keyboardType="numeric"
          />

          {errors !== "" && (
            <View style={styles.errorContainer}>
              <Icon
                name="exclamation-circle"
                size={20}
                color={Colours.danger}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{errors}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <ButtonGradient
              authHandler={handleAddEvent}
              text="Add Event"
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 42,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  form: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    marginBottom: 8,
    color: Colours.darkText,
  },
  input: {
    height: 50,
    borderColor: Colours.outline,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  addIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colours.primary,
    borderStyle: "dashed",
    position: "relative",
  },
  imagePickerText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colours.primary,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
  },
  errorText: {
    color: Colours.danger,
    marginLeft: 10,
    fontFamily: FontFamily.regular,
  },
});
