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
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/FontAwesome";

const EditEventScreen = ({ navigation, route }) => {
  const {
    id,
    category: initialCategory,
    image: initialImage,
    text: initialText,
    date: initialDate,
    location: initialLocation,
    attending,
    organiserId,
    organiserUsername,
    organiserEmail,
    organiserProfileURL,
    max_attendees: initialMaxAttendees,
    details: initialDetails,
    coordinates,
    price: initialPrice,
    eventType,
  } = route.params;

  const { editEvent } = useContext(AuthContext);

  const [category, setCategory] = useState(initialCategory);
  const [eventName, setEventName] = useState(initialText);
  const [eventDate, setEventDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);
  const [eventLocation, setEventLocation] = useState(initialLocation);
  const [latitude, setLatitude] = useState(
    coordinates ? coordinates.latitude : ""
  );
  const [longitude, setLongitude] = useState(
    coordinates ? coordinates.longitude : ""
  );
  const [maxAttendees, setMaxAttendees] = useState(initialMaxAttendees);
  const [eventPrice, setEventPrice] = useState(initialPrice);
  const [image, setImage] = useState(initialImage);
  const [eventDetails, setEventDetails] = useState(initialDetails);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleSave = async () => {
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

    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      setErrors("Latitude and longitude must be valid numbers");
      formIsValid = false;
    }

    if (formIsValid) {
      setLoading(true);

      const updatedEvent = {
        category,
        image,
        name: eventName,
        date: eventDate,
        location: eventLocation,
        max_attendees: maxAttendees,
        price: eventPrice,
        details: eventDetails,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      };

      try {
        const response = await editEvent(id, updatedEvent);
        if (response) {
          console.log("Event updated successfully", response);
          ToastAndroid.show("Event updated successfully", ToastAndroid.SHORT);
          navigation.navigate("EventScreen");
        }
      } catch (error) {
        console.log("Error updating event", error);
        ToastAndroid.show("Error updating event", ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    }
  };

  console.log("Error", errors);

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
        <Text style={styles.title}>Edit Event</Text>
      </View>

      <ScrollView>
        <View style={styles.form}>
          {image && (
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: image }} style={styles.image} />
            </TouchableOpacity>
          )}
          <Text style={styles.label}>Select Category</Text>
          <Picker
            selectedValue={category}
            style={styles.input}
            onValueChange={(itemValue) => setCategory(itemValue)}
          >
            <Picker.Item label={category} value="" />
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
            value={latitude.toString()}
            onChangeText={setLatitude}
            placeholder="Enter latitude"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={longitude.toString()}
            onChangeText={setLongitude}
            placeholder="Enter longitude"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Event Details</Text>
          <TextInput
            style={[styles.input, styles.detailsInput]}
            value={eventDetails}
            onChangeText={setEventDetails}
            placeholder="Enter event details"
            multiline
          />

          <Text style={styles.label}>Max Attendees</Text>
          <TextInput
            style={styles.input}
            value={maxAttendees.toString()}
            onChangeText={(text) => setMaxAttendees(parseInt(text))}
            placeholder="Enter max attendees"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Event Price</Text>
          <TextInput
            style={styles.input}
            value={eventPrice.toString()}
            onChangeText={(text) => setEventPrice(parseFloat(text))}
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
              authHandler={handleSave}
              loading={loading}
              text="Save Changes"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditEventScreen;

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
  detailsInput: {
    height: 100,
    textAlignVertical: "top",
    paddingVertical: 10,
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
    marginLeft: 20,
    flexDirection: "row",
  },
  errorText: {
    color: Colours.danger,
    marginLeft: 10,
    fontFamily: FontFamily.regular,
  },
});
