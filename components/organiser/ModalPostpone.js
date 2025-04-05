import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import Colours from "../../constants/Colours";
import { StatusBar } from "expo-status-bar";
import FontFamily from "../../constants/Fonts";
import { AuthContext } from "../../context/AuthContext";

const ModalPostpone = ({
  visible,
  onClose,
  existingDate,
  eventId,
  eventName,
  navigation,
}) => {
  const { updateEventDateTime } = useContext(AuthContext);
  const parsedExistingDate = parse(
    existingDate,
    "EEE, MMM d 'at' h:mm a",
    new Date()
  );
  const [newDate, setNewDate] = useState(parsedExistingDate);
  const [isDateTimeSet, setIsDateTimeSet] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("date");

  const onChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || newDate;

    if (mode === "date") {
      setNewDate(
        (prevDate) =>
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            prevDate.getHours(),
            prevDate.getMinutes()
          )
      );
      setMode("time");
    } else {
      setNewDate(
        (prevDate) =>
          new Date(
            prevDate.getFullYear(),
            prevDate.getMonth(),
            prevDate.getDate(),
            currentDate.getHours(),
            currentDate.getMinutes()
          )
      );
      setShowPicker(false);
      setIsDateTimeSet(true);
    }
  };

  const showDatePicker = () => {
    setIsDateTimeSet(false);
    setMode("date");
    setShowPicker(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateEventDateTime(
        eventId,
        newDate,
        "Event Postponed",
        `Your event ${eventName} has been postponed to ${format(
          newDate,
          "EEE, MMM d 'at' h:mm a"
        )}`
      );
      onClose();
      navigation.goBack();
      ToastAndroid.show("Event postponed successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.log("Error updating event date:", error);
      ToastAndroid.show("Error updating event date", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modal}>
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Postpone Event</Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Existing Date:</Text>
            <TextInput
              style={styles.input}
              value={format(parsedExistingDate, "EEE, MMM d 'at' h:mm a")}
              editable={false}
            />
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Enter New Date and Time:</Text>
            <TouchableOpacity onPress={showDatePicker}>
              <TextInput
                style={styles.input}
                value={
                  isDateTimeSet ? format(newDate, "EEE, MMM d 'at' h:mm a") : ""
                }
                editable={false}
              />
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={newDate}
                mode={mode}
                display="default"
                onChange={onChange}
                minimumDate={parsedExistingDate}
              />
            )}
          </View>
          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={onClose}>
              <Text style={styles.resetButtonText}>Cancel</Text>
            </TouchableOpacity>
            {loading ? (
              <View style={styles.applyButton}>
                <ActivityIndicator size="small" color="white" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  if (isDateTimeSet && newDate > parsedExistingDate) {
                    handleConfirm();
                  }
                }}
                disabled={!isDateTimeSet || newDate <= parsedExistingDate}
              >
                <Text style={styles.applyButtonText}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <StatusBar style="auto" backgroundColor={Colours.modalBackground} />
    </Modal>
  );
};

export default ModalPostpone;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.modalBackground,
  },
  filterContainer: {
    backgroundColor: "white",
    width: "90%",
    borderRadius: 25,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
  },
  iconClose: {
    marginLeft: 20,
  },
  dateContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colours.mediumBackground,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: FontFamily.regular,
    color: Colours.lightText,
  },
  filterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  resetButton: {
    paddingHorizontal: 43,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colours.mediumBackground,
  },
  resetButtonText: {
    color: Colours.primary,
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
  applyButton: {
    paddingHorizontal: 43,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colours.primary,
  },
  applyButtonText: {
    color: "white",
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
});
