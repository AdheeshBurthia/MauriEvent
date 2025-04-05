import { createContext, useState } from "react";
import {
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { parse, differenceInDays, set } from "date-fns";

import { auth, db, storage } from "../config/firebase";
import ModalError from "../components/ModalError";
import { decryptData, encryptData } from "../utilities/aes";
import secretKey from "../utilities/keys";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AuthContext = createContext();

export { AuthContext };

const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [listView, setListView] = useState(false);
  const [myLatitude, setMyLatitude] = useState(0);
  const [myLongitude, setMyLongitude] = useState(0);
  const [isLocationAvailable, setIsLocationAvailable] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [priceRange, setPriceRange] = useState(5000);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [media, setMedia] = useState([]);
  const [userNotifications, setUserNotifications] = useState({
    list: [],
    unReadCount: 0,
  });

  const authenticate = async (token, isVerified, userId) => {
    if (!token || !isVerified) {
      console.log("Invalid token or not verified.");
      return;
    }
    try {
      await AsyncStorage.setItem("token", token.toString());
      await AsyncStorage.setItem("userId", userId.toString());

      setToken(token);
      setUserId(userId);
      setIsLoggedIn(true);
    } catch (error) {
      console.log("Error storing data:", error);
    }
  };

  const logout = async () => {
    try {
      // Remove token and user ID from AsyncStorages
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("userId");

      await signOut(auth);
      setToken(null);
      setIsLoggedIn(false);
      setUserId(null);
      setUserData(null);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  // add user to the database
  const addUser = async (id, username, email) => {
    const timestamp = serverTimestamp();
    try {
      await setDoc(doc(db, "users", id), {
        username: username,
        email: email,
        categories: [],
        listView: true,
        profileURL: null,
        userType: "user",
        pushToken: null,
        createdAt: timestamp,
        cardLinked: false,
        walletBalance: 0,
        notificationStatus: true,
      });
      sendNotification(
        "Welcome to MauriEvent",
        "Your account has been successfully created. Start exploring events now!"
      );
      console.log("User added with ID: ", id);
    } catch (error) {
      console.log("Error adding user: ", error);
    }
  };

  // Set up push notifications for the user
  const setUpPushNotifications = async () => {
    let statusobj;

    // Check current notification permissions
    statusobj = await Notifications.getPermissionsAsync();
    console.log(statusobj.status); // granted, undetermined, denied

    // If permissions not granted, request them
    if (statusobj.status !== "granted") {
      statusobj = await Notifications.requestPermissionsAsync();
      if (statusobj.status !== "granted") {
        alert("Permission not granted to show notifications");
        return;
      }
    }

    // Permission was granted, so we now get the push token
    const tokenObj = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });

    await updateDoc(doc(db, "users", userId), {
      pushToken: tokenObj.data,
    });

    // Additional setup for Android notification channels
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
  };

  // get user data from the database
  const getUserData = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const {
          username,
          email,
          profileURL,
          userType,
          cardLinked,
          walletBalance,
          categories,
          listView,
          notificationStatus,
        } = userData;

        if (userType === "user") {
          setUserData({
            username,
            email,
            categories,
            listView,
            profileURL,
            userType,
            cardLinked,
            walletBalance,
            notificationStatus,
          });
          setUserImage(profileURL);
        } else if (userType === "organiser") {
          setUserData({
            username,
            email,
            profileURL,
            userType,
            cardLinked,
            walletBalance,
            notificationStatus,
          });
          setUserImage(profileURL);
        } else {
          console.log("Invalid user type!");
          return null;
        }
        return userData;
      } else {
        console.log("No such user!");
        return null;
      }
    } catch (error) {
      console.log("Error getting user data:", error);
      setIsModalVisible(true);
    }
  };

  // get transactions from the database
  const getTransactions = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      const querySnapshot = await getDocs(
        query(transactionsRef, where("userId", "==", userId))
      );

      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          transactionType: data.transactionType,
          transactionStatus: data.transactionStatus,
          transactionAmount: data.transactionAmount,
          createdAt: data.createdAt,
        };
      });
      setTransactions(transactions);
      return transactions;
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  // get media from the database for organisers
  const getOrganiserData = async () => {
    try {
      const mediaRef = collection(db, "media");
      const eventsRef = collection(db, "events");

      const [mediaQuerySnapshot, eventsQuerySnapshot] = await Promise.all([
        getDocs(query(mediaRef, where("organiserId", "==", userId))),
        getDocs(query(eventsRef, where("organiserId", "==", userId))),
      ]);

      const media = mediaQuerySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          mediaType: data.mediaType,
          mediaURL: data.mediaURL,
          mediaName: data.mediaName,
        };
      });

      const events = eventsQuerySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          image: data.image,
          name: data.name,
          location: data.location,
          datetime: data.datetime,
          category: data.category,
          price: data.price,
          max_attendees: data.max_attendees,
          attending: data.attending,
          details: data.details,
          coordinates: data.coordinates,
        };
      });

      setUserData({
        ...userData,
        media: media,
        organiserEvents: events,
      });

      return { media, events };
    } catch (error) {
      console.log("Error fetching organiser data:", error);
    }
  };

  // get all media from the database
  const getAllMedia = async () => {
    try {
      const mediaRef = collection(db, "media");
      const querySnapshot = await getDocs(mediaRef);

      const media = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          mediaType: data.mediaType,
          mediaURL: data.mediaURL,
          mediaName: data.mediaName,
          organiserId: data.organiserId,
        };
      });

      setMedia(media);

      return media;
    } catch (error) {
      console.log("Error fetching media:", error);
    }
  };

  // add media to the database
  const addMedia = async (mediaURL) => {
    const type = mediaURL.split(".").pop();
    const mediaType = type === "jpg" || type === "png" ? "image" : "video";
    try {
      if (!userId || !mediaType || !mediaURL) {
        console.log("userId, mediaType, or mediaURL is missing");
        return false;
      }

      // Fetch the media from URL
      const response = await fetch(mediaURL);
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      // Convert media to blob
      const blob = await response.blob();

      // Storage references based on media type and userId
      let storageRef;
      let mediaName = Date.now().toString();
      if (mediaType === "jpg" || mediaType === "png") {
        // If mediaType is image, store in images folder

        storageRef = ref(
          storage,
          `organisers/${userId}/images/${mediaName}.jpg`
        );
      } else if (mediaType === "mp4") {
        // If mediaType is video, store in videos folder
        storageRef = ref(
          storage,
          `organisers/${userId}/videos/${Date.now()}.mp4`
        );
      } else {
        console.log("Unsupported media type");
        return false;
      }

      // Upload task for the media blob
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Monitor upload progress and completion
      const uploadCompletePromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            console.log("Error uploading media:", error);
            reject(error);
          },
          async () => {
            try {
              // Get the download URL for the uploaded media
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File available at", downloadURL);

              // Add media document to Firestore
              const mediaRef = collection(db, "media");
              await addDoc(mediaRef, {
                organiserId: userId,
                mediaType: mediaType,
                mediaURL: downloadURL,
                mediaName: mediaName,
                createdAt: serverTimestamp(),
              });

              // Update local state if needed
              setUserData((prevUserData) => {
                const updatedMedia = [
                  ...prevUserData.media,
                  { mediaType, mediaURL: downloadURL },
                ];
                return { ...prevUserData, media: updatedMedia };
              });

              resolve(downloadURL);
            } catch (error) {
              console.log(
                "Error getting download URL or adding media document:",
                error
              );
              reject(error);
            }
          }
        );
      });

      // Wait for upload completion
      await uploadCompletePromise;

      return true;
    } catch (error) {
      console.log("Error uploading media:", error);
      return false;
    }
  };

  // delete media from the database
  const deleteMedia = async (mediaType, mediaName) => {
    try {
      // Define the path to the folder to be deleted
      const folderToDelete = `organisers/${userId}/${mediaType}s`;

      // Create a reference to the folder
      const folderRef = ref(storage, folderToDelete);

      // List all items in the folder
      const items = await listAll(folderRef);

      // Loop through each item in the folder and delete it
      await Promise.all(
        items.items.map(async (itemRef) => {
          const name = itemRef.name;
          if (name.includes(mediaName)) {
            await deleteObject(itemRef);
          }
        })
      );

      // Delete the media document from Firestore
      const mediaRef = collection(db, "media");
      const querySnapshot = await getDocs(
        query(
          mediaRef,
          where("organiserId", "==", userId),
          where("mediaName", "==", mediaName)
        )
      );

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Update local state if needed
      setUserData((prevUserData) => {
        const updatedMedia = prevUserData.media.filter(
          (media) => media.mediaName !== mediaName
        );
        return { ...prevUserData, media: updatedMedia };
      });

      console.log("Media deleted successfully");

      return true;
    } catch (error) {
      console.log("Error deleting media:", error);
      return false;
    }
  };

  // check if user exist in the database
  const checkUser = async (email) => {
    try {
      const userRef = collection(db, "users");
      const querySnapshot = await getDocs(
        query(userRef, where("email", "==", email))
      );

      console.log("User exists: ", querySnapshot);

      if (querySnapshot.empty) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log("Error checking user: ", error);
    }
  };

  // get all event categories from the database
  const getAllCategories = async () => {
    try {
      const categoriesRef = collection(db, "eventCategory");
      const querySnapshot = await getDocs(categoriesRef);

      const categories = querySnapshot.docs.map((doc) => {
        return {
          id: doc.data().id,
          name: doc.id,
          image: doc.data().imageURL,
        };
      });

      return categories;
    } catch (error) {
      console.log("Error getting categories:", error);
    }
  };

  // Update the user document with the chosen categories
  const updateUserCategories = async (userId, categories) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        categories: categories,
      });
      console.log("User categories updated");
      await getUserData(userId);
      return true;
    } catch (error) {
      console.log("Error updating user categories: ", error);
      return false;
    }
  };

  // Function to get events for the user based on selected categories
  const getEventsForUser = async (userCategories) => {
    if (!userCategories || userCategories.length === 0) {
      console.log("No categories provided");
      return []; // No categories provided
    }

    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const events = [];

      const likedEventSnapshot = await getDocs(
        query(collection(db, "likedEvents"), where("userId", "==", userId))
      );
      const likedEventIds = likedEventSnapshot.docs.map(
        (doc) => doc.data().eventId
      );

      const bookedEventSnapshot = await getDocs(
        query(
          collection(db, "transactions"),
          where("userId", "==", userId),
          where("transactionType", "in", ["Booking", "Refund"])
        )
      );
      const bookedTickets = bookedEventSnapshot.docs.map((doc) => ({
        eventId: doc.data().eventId,
        bookingStatus: doc.data().transactionStatus,
      }));

      // Fetch organizers' details
      const organiserRef = collection(db, "users");
      const organiserSnapshot = await getDocs(
        query(organiserRef, where("userType", "==", "organiser"))
      );
      const organisersMap = {};
      organiserSnapshot.forEach((doc) => {
        const organiserData = doc.data();
        organisersMap[doc.id] = {
          username: organiserData.username,
          email: organiserData.email,
          profileURL: organiserData.profileURL,
        };
      });

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventCategories = eventData.category || [];

        // Check if any category in userCategories exists in eventCategories
        const hasCategoryMatch = userCategories.some((category) =>
          eventCategories.includes(category)
        );

        if (hasCategoryMatch) {
          const eventId = doc.id;
          const booking = bookedTickets.find(
            (ticket) => ticket.eventId === eventId
          );
          const isBooked = booking
            ? booking.bookingStatus !== "Cancelled"
            : false;

          // Include organiser details if organiserId matches
          const organiserDetails = organisersMap[eventData.organiserId];

          events.push({
            id: eventId,
            ...eventData,
            organiserUsername: organiserDetails.username,
            organiserEmail: organiserDetails.email,
            organiserProfileURL: organiserDetails.profileURL,
            isLiked: likedEventIds.includes(eventId), // Add isLiked status
            isBooked: isBooked, // Add isBooked status
          });
        }
      });

      setUserData({
        ...userData,
        userEvents: events,
        favouriteEvents: likedEventIds,
        bookedTickets: bookedTickets,
      });
      return events;
    } catch (error) {
      console.log("Error fetching events for user:", error);
      return []; // Return an empty array on error
    }
  };

  // Function to get events for the organiser
  const getUserNotifications = async () => {
    try {
      const notificationRef = collection(db, "notifications");
      const notificationSnapshot = await getDocs(
        query(notificationRef, where("userId", "==", userId))
      );

      const notifications = notificationSnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          notificationHeader: doc.data().notificationHeader,
          notificationMessage: doc.data().notificationMessage,
          notificationTimestamp: doc.data().notificationTimestamp,
          readStatus: doc.data().readStatus,
        };
      });

      // Calculate unread count
      const unReadCount = notifications.filter(
        (notification) => !notification.readStatus
      ).length;

      // Add unReadCount to the notifications object
      const notificationsWithCount = {
        list: notifications,
        unReadCount: unReadCount,
      };

      setUserNotifications(notificationsWithCount);

      return notificationsWithCount;
    } catch (error) {
      console.log("Error fetching notifications:", error);
      return { list: [], unReadCount: 0 };
    }
  };

  // Function to mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      setUserNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.list.map(
          (notification) =>
            notification.id === notificationId
              ? { ...notification, readStatus: true }
              : notification
        );
        return {
          list: updatedNotifications,
          unReadCount: prevNotifications.unReadCount - 1,
        };
      });

      await updateDoc(doc(db, "notifications", notificationId), {
        readStatus: true,
      });

      console.log("Notification marked as read:", notificationId);
      return true;
    } catch (error) {
      console.log("Error marking notification as read:", error);
      return false;
    }
  };

  // Function to send notification to the device
  const sendDeviceNotification = (notificationHeader, notificationMessage) => {
    console.log("Sending notification...");

    Notifications.scheduleNotificationAsync({
      content: {
        title: notificationHeader,
        body: notificationMessage,
        data: { userId: userId },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  // Function to send notification
  const sendNotification = async (notificationHeader, notificationMessage) => {
    try {
      const notificationRef = collection(db, "notifications");
      await addDoc(notificationRef, {
        userId: userId,
        notificationHeader: notificationHeader,
        notificationMessage: notificationMessage,
        notificationTimestamp: serverTimestamp(),
        readStatus: false,
      });

      if (userData.notificationStatus) {
        sendDeviceNotification(notificationHeader, notificationMessage);
      }

      getUserNotifications();

      return true;
    } catch (error) {
      console.log("Error sending notification:", error);
      return false;
    }
  };

  // Function to handle notification status
  const handleNotificationStatus = async (isEnabled) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        notificationStatus: isEnabled,
      });

      setUserData({ ...userData, notificationStatus: isEnabled });
      return true;
    } catch (error) {
      console.log("Error toggling notifications: ", error);
      return false;
    }
  };

  // Send push notification
  const sendPushNotification = async (token, header, message) => {
    console.log("Sending push notification through code...");
    console.log("Token in auth:  ", token);

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title: header,
        body: message,
      }),
    });
  };

  // Function to get booked users' push tokens
  const getBookedUsersToken = async (eventId) => {
    try {
      const transactionRef = collection(db, "transactions");
      const querySnapshot = await getDocs(
        query(
          transactionRef,
          where("eventId", "==", eventId),
          where("transactionType", "==", "Booking")
        )
      );

      // Array to hold userIds of booked users
      const bookedUserIds = querySnapshot.docs.map((doc) => doc.data().userId);

      // Get users data and extract pushTokens
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const pushTokens = [];
      usersSnapshot.forEach((doc) => {
        const userId = doc.id;
        const userData = doc.data();
        if (bookedUserIds.includes(userId)) {
          const pushToken = userData.pushToken;
          if (pushToken.startsWith("ExponentPushToken[")) {
            pushTokens.push(pushToken);
          }
        }
      });

      return pushTokens;
    } catch (error) {
      console.log("Error fetching booked users:", error);
      return [];
    }
  };

  // Update the event date and time
  const updateEventDateTime = async (eventId, newDateTime, header, message) => {
    try {
      await updateDoc(doc(db, "events", eventId), {
        datetime: newDateTime,
      });

      const response = await getBookedUsersToken(eventId);
      if (response) {
        sendPushNotification(response, header, message);
      }

      // update local state for organiserEvent
      setUserData((prevUserData) => {
        const updatedEvents = prevUserData.organiserEvents.map((event) =>
          event.id === eventId ? { ...event, datetime: newDateTime } : event
        );
        return { ...prevUserData, organiserEvents: updatedEvents };
      });

      console.log("Event date and time updated");
      return true;
    } catch (error) {
      console.log("Error updating event date and time:", error);
      return false;
    }
  };

  // Function to like an event
  const likeEvent = async (eventId) => {
    // Update the userEvents and favouriteEvents in userData
    setUserData((prevUserData) => {
      const updatedEvents = prevUserData.userEvents.map((event) =>
        event.id === eventId ? { ...event, isLiked: true } : event
      );
      const updatedFavourites = [...prevUserData.favouriteEvents, eventId];
      return {
        ...prevUserData,
        userEvents: updatedEvents,
        favouriteEvents: updatedFavourites,
      };
    });

    // Add the event to the likedEvents collection
    try {
      const likedEventsRef = collection(db, "likedEvents");
      const querySnapshot = await getDocs(
        query(
          likedEventsRef,
          where("eventId", "==", eventId),
          where("userId", "==", userId)
        )
      );
      if (querySnapshot.empty) {
        await addDoc(likedEventsRef, {
          eventId: eventId,
          userId: userId,
          createdOn: serverTimestamp(),
        });
      } else {
        console.log("Event already liked");
      }
    } catch (error) {
      console.log("Error liking event:", error);
    }
  };

  // Function to unlike an event
  const unlikeEvent = async (eventId) => {
    // Update the userEvents and favouriteEvents in userData
    setUserData((prevUserData) => {
      const updatedEvents = prevUserData.userEvents.map((event) =>
        event.id === eventId ? { ...event, isLiked: false } : event
      );
      const updatedFavourites = prevUserData.favouriteEvents.filter(
        (id) => id !== eventId
      );
      return {
        ...prevUserData,
        userEvents: updatedEvents,
        favouriteEvents: updatedFavourites,
      };
    });

    // Remove the event from the likedEvents collection
    try {
      const likedEventsRef = collection(db, "likedEvents");
      const querySnapshot = await getDocs(
        query(
          likedEventsRef,
          where("eventId", "==", eventId),
          where("userId", "==", userId)
        )
      );
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.log("Error unliking event:", error);
    }
  };

  // Change listView for the user
  const toggleView = async (isEnabled) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        listView: isEnabled,
      });

      console.log(
        `ListView set to ${isEnabled ? "true" : "false"} for user ${userId}`
      );
      setUserData({ ...userData, listView: isEnabled });
    } catch (error) {
      console.log("Error toggling notifications: ", error);
    }
  };

  // Function to update profile
  const updateProfile = async (username, image) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        username: username,
      });

      if (image) {
        await uploadProfilePicture(image);
      }

      // Update local state
      setUserData({ ...userData, username: username });
      return true;
    } catch (error) {
      console.log("Error updating username:", error);
      return false;
    }
  };

  // Function to upload profile picture
  const uploadProfilePicture = async (image) => {
    try {
      if (!image) {
        console.log("Image is null or undefined");
        return false;
      }

      const response = await fetch(image);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();

      // Define the path to the folder to be deleted
      const folderToDelete = `users/${userId}`;

      // Create a reference to the folder
      const folderRef = ref(storage, folderToDelete);

      // List all items in the folder
      const items = await listAll(folderRef);

      // Loop through each item in the folder and delete it
      items.items.forEach(async (itemRef) => {
        await deleteObject(itemRef);
      });

      const storageRef = ref(storage, `users/${userId}/` + Date.now());
      const uploadTask = uploadBytesResumable(storageRef, blob);

      const uploadCompletePromise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            console.log("Error uploading image:", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File available at", downloadURL);

              // Update user document with the profileURL
              await updateDoc(doc(db, "users", userId), {
                profileURL: downloadURL,
              });

              // Update local state if needed
              setUserData({ ...userData, profileURL: downloadURL });
              setUserImage(downloadURL);

              resolve(true);
            } catch (error) {
              console.log(
                "Error getting download URL or updating user document:",
                error
              );
              reject(error);
            }
          }
        );
      });

      await uploadCompletePromise;

      return true;
    } catch (error) {
      console.log("Error uploading profile picture:", error);
      return false;
    }
  };

  // Function to remove profile picture
  const deleteProfilePicture = async () => {
    try {
      // Define the path to the folder to be deleted
      const folderToDelete = `users/${userId}`;

      // Create a reference to the folder
      const folderRef = ref(storage, folderToDelete);

      // List all items in the folder
      const items = await listAll(folderRef);

      // Loop through each item in the folder and delete it
      await Promise.all(
        items.items.map(async (itemRef) => {
          await deleteObject(itemRef);
        })
      );

      // Optionally, update user document to remove profileURL
      await updateDoc(doc(db, "users", userId), {
        profileURL: null,
      });

      // Optionally, update local state if needed
      setUserData({ ...userData, profileURL: null });
      setUserImage(null);

      console.log("Successfully removed image");
      return true;
    } catch (error) {
      console.log("Error removing image:", error);
      return false;
    }
  };

  // Function to add bank to the database
  const addCard = async (cardNumber, cardHolder, expiryDate, cvv) => {
    try {
      const cardExists = await checkCard(
        cardNumber,
        cardHolder,
        expiryDate,
        cvv
      );
      if (!cardExists) {
        return false;
      }

      const encryptedCardNumber = encryptData(cardNumber, secretKey);
      const encryptedCvv = encryptData(cvv, secretKey);

      const bankRef = collection(db, "creditCard");
      await addDoc(bankRef, {
        cardHolderName: cardHolder,
        cardNumber: encryptedCardNumber,
        expiryDate: expiryDate,
        cvv: encryptedCvv,
        userId: userId,
        createdAt: serverTimestamp(),
      });

      // Update local state
      setUserData({ ...userData, cardLinked: true });

      await updateDoc(doc(db, "users", userId), {
        cardLinked: true,
      });

      return true;
    } catch (error) {
      console.log("Error adding card:", error);
      return {
        success: false,
        message: "Error adding card. Please try again later.",
      };
    }
  };

  // Function to check if card exists in the database
  const checkCard = async (cardNumber, cardHolder, expiryDate, cvv) => {
    try {
      const bankRef = collection(db, "bank");
      const querySnapshot = await getDocs(bankRef);

      let cardExists = false;

      for (const doc of querySnapshot.docs) {
        const encrytedCardNumber = doc.data().cardNumber;
        const cardHolderName = doc.data().cardHolderName;
        const expiryCardDate = doc.data().expiryDate;
        const encryptedCvv = doc.data().cvv;
        const amount = doc.data().amount;

        // Decrypt the card number and CVV using the provided secret key
        const decryptedCardNumber = decryptData(encrytedCardNumber, secretKey);
        const decryptedCvv = decryptData(encryptedCvv, secretKey);

        if (
          decryptedCardNumber === cardNumber &&
          cardHolderName === cardHolder &&
          expiryCardDate === expiryDate &&
          decryptedCvv === cvv
        ) {
          cardExists = true; // Found a match, return true
        }
      }

      return cardExists; // No matching document found
    } catch (error) {
      console.log("Error checking card: ", error);
      return false; // Return false if there's an error
    }
  };

  // Function to remove card from the database
  const removeCard = async () => {
    try {
      const cardRef = collection(db, "creditCard");
      const querySnapshot = await getDocs(
        query(cardRef, where("userId", "==", userId))
      );

      if (querySnapshot.empty) {
        console.log("No cards found for this user.");
        return false;
      }

      const deletePromises = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      });

      await Promise.all(deletePromises);

      await updateDoc(doc(db, "users", userId), {
        cardLinked: false,
      });

      setUserData({ ...userData, cardLinked: false });

      console.log("Successfully removed card(s) for user:", userId);
      return true;
    } catch (error) {
      console.log("Error removing card:", error);
      return {
        success: false,
        message: "Error removing card. Please try again later.",
      };
    }
  };

  // Function to retrieve card from the database
  const retrieveCard = async () => {
    try {
      const cardRef = collection(db, "creditCard");
      const querySnapshot = await getDocs(
        query(cardRef, where("userId", "==", userId))
      );

      if (querySnapshot.empty) {
        console.log("No cards found for this user.");
        return [];
      }

      const cards = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          cardHolderName: data.cardHolderName,
          cardNumber: decryptData(data.cardNumber, secretKey),
          expiryDate: data.expiryDate,
          cvv: decryptData(data.cvv, secretKey),
        };
      });

      return cards;
    } catch (error) {
      console.log("Error retrieving cards:", error);
      return {
        success: false,
        message: "Error retrieving cards. Please try again later.",
      };
    }
  };

  // Function to add amount to the wallet
  const addAmount = async (
    cardNumber,
    cardHolderName,
    expiryDate,
    cvv,
    amount
  ) => {
    const response = await checkAmount(
      cardNumber,
      cardHolderName,
      expiryDate,
      cvv
    );
    console.log("Response: ", response);
    if (response === null) {
      return {
        success: false,
        message: "An error occurred. Please check and try again.",
      };
    }

    if (amount > response.amount) {
      return {
        success: false,
        message: "Insufficient funds in card.",
      };
    }

    try {
      const bankDocRef = doc(db, "bank", response.cardId);
      const bankDoc = await getDoc(bankDocRef);
      const currentBankAmount = bankDoc.data().amount;

      await updateDoc(bankDocRef, {
        amount: currentBankAmount - amount,
      });

      await updateDoc(doc(db, "users", userId), {
        walletBalance: userData.walletBalance + amount,
      });

      const transactionRef = collection(db, "transactions");
      await addDoc(transactionRef, {
        transactionType: "Top-up",
        transactionAmount: amount,
        userId: userId,
        createdAt: serverTimestamp(),
      });

      setUserData({
        ...userData,
        walletBalance: userData.walletBalance + amount,
      });
      return {
        success: true,
        message: "Amount added successfully.",
      };
    } catch (error) {
      console.log("Error adding amount:", error);
      return {
        success: false,
        message: "Error adding amount. Please try again later.",
      };
    }
  };

  // Function to check amount in the card
  const checkAmount = async (cardNumber, cardHolder, expiryDate, cvv) => {
    try {
      const bankRef = collection(db, "bank");
      const querySnapshot = await getDocs(bankRef);

      for (const doc of querySnapshot.docs) {
        const encrytedCardNumber = doc.data().cardNumber;
        const cardHolderName = doc.data().cardHolderName;
        const expiryCardDate = doc.data().expiryDate;
        const encryptedCvv = doc.data().cvv;
        const amount = doc.data().amount;

        // Decrypt the card number and CVV using the provided secret key
        const decryptedCardNumber = decryptData(encrytedCardNumber, secretKey);
        const decryptedCvv = decryptData(encryptedCvv, secretKey);

        if (
          decryptedCardNumber === cardNumber &&
          cardHolderName === cardHolder &&
          expiryCardDate === expiryDate &&
          decryptedCvv === cvv
        ) {
          return {
            amount: amount,
            cardId: doc.id,
          };
        }
      }

      return null;
    } catch (error) {
      console.log("Error checking card: ", error);
      return false; // Return false if there's an error
    }
  };

  // Function to add booking to the database
  const addBooking = async (eventId, eventDate, price, organiserId) => {
    try {
      // Check if the booking already exists
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("eventId", "==", eventId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      // If booking does not exist, add a new booking
      if (price !== "Free") {
        // Update user's wallet balance
        await updateDoc(doc(db, "users", userId), {
          walletBalance: userData.walletBalance - price,
        });

        // get organiser wallet
        const organiserDocRef = doc(db, "users", organiserId);
        const organiserDoc = await getDoc(organiserDocRef);
        const organiserData = organiserDoc.data();
        const organiserWallet = organiserData.walletBalance;

        // Update organiser's wallet balance
        await updateDoc(doc(db, "users", organiserId), {
          walletBalance: organiserWallet + price,
        });

        setUserData({
          ...userData,
          walletBalance: userData.walletBalance - price,
        });
      }

      if (!querySnapshot.empty) {
        // Booking already exists, update the existing booking
        const existingBooking = querySnapshot.docs[0];
        const transactionId = existingBooking.id;

        await updateDoc(doc(db, "transactions", transactionId), {
          eventDate: eventDate,
          transactionAmount: price,
          transactionStatus: "Upcoming",
          transactionType: "Booking",
          scanned: false,
          dateScanned: null,
          organiserId: organiserId,
          createdAt: serverTimestamp(),
        });

        // Update userData
        setUserData((prevUserData) => {
          const updatedEvents = prevUserData.userEvents.map((event) =>
            event.id === eventId ? { ...event, isBooked: true } : event
          );

          const updatedBookings = prevUserData.bookedTickets.map((ticket) =>
            ticket.eventId === eventId
              ? { ...ticket, bookingStatus: "Upcoming" }
              : ticket
          );

          return {
            ...prevUserData,
            userEvents: updatedEvents,
            bookedTickets: updatedBookings,
          };
        });

        getTransactions(); // Refresh the transactions list if needed

        return true;
      }

      const bookingRef = collection(db, "transactions");
      await addDoc(bookingRef, {
        userId: userId,
        eventId: eventId,
        eventDate: eventDate,
        transactionAmount: price,
        transactionStatus: "Upcoming",
        transactionType: "Booking",
        scanned: false,
        dateScanned: null,
        organiserId: organiserId,
        createdAt: serverTimestamp(),
      });

      // Update userData
      setUserData((prevUserData) => {
        const updatedEvents = prevUserData.userEvents.map((event) =>
          event.id === eventId ? { ...event, isBooked: true } : event
        );
        const updatedBookings = [
          ...prevUserData.bookedTickets,
          { eventId, bookingStatus: "Upcoming" },
        ];
        return {
          ...prevUserData,
          userEvents: updatedEvents,
          bookedTickets: updatedBookings,
        };
      });

      getTransactions(); // Refresh the transactions list if needed

      return true;
    } catch (error) {
      console.log("Error adding booking:", error);
      return false;
    }
  };

  // Function to cancel booking
  const cancelBooking = async (eventId, price, date, organiserId) => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("eventId", "==", eventId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Transaction not found");
        return;
      }

      const transactionDoc = querySnapshot.docs[0];
      const transactionId = transactionDoc.id;

      let refundAmount = 0;

      // Update wallet balance if the booking was not free
      if (price !== "Free") {
        const eventDate = parse(date, "EEE, MMM d 'at' h:mm a", new Date());
        const currentDate = new Date();

        // Calculate the number of days left until the event
        const daysLeft = differenceInDays(eventDate, currentDate);

        // Determine the refund amount based on the days left
        if (daysLeft >= 8) {
          refundAmount = price; // 100%
        } else if (daysLeft >= 1 && daysLeft <= 7) {
          refundAmount = price * 0.5; // 50%
        } else if (daysLeft === 0) {
          refundAmount = 0; // 0%
        }

        // Update the user's wallet balance
        await updateDoc(doc(db, "users", userId), {
          walletBalance: userData.walletBalance + refundAmount,
        });

        // get organiser wallet
        const organiserDocRef = doc(db, "users", organiserId);
        const organiserDoc = await getDoc(organiserDocRef);
        const organiserData = organiserDoc.data();
        const organiserWallet = organiserData.walletBalance;

        // Update organiser's wallet balance
        await updateDoc(doc(db, "users", organiserId), {
          walletBalance: organiserWallet - refundAmount,
        });
      }

      // Update the transaction status to "Cancelled"
      await updateDoc(doc(db, "transactions", transactionId), {
        transactionStatus: "Cancelled",
        transactionType: "Refund",
        transactionAmount: refundAmount,
        cancelledAt: serverTimestamp(),
      });

      // Update userData after Firestore updates
      setUserData((prevUserData) => {
        const updatedEvents = prevUserData.userEvents.map((event) =>
          event.id === eventId ? { ...event, isBooked: false } : event
        );

        const updatedBookings = prevUserData.bookedTickets.map((ticket) =>
          ticket.eventId === eventId
            ? { ...ticket, bookingStatus: "Cancelled" }
            : ticket
        );

        return {
          ...prevUserData,
          userEvents: updatedEvents,
          bookedTickets: updatedBookings,
          walletBalance:
            price !== "Free"
              ? prevUserData.walletBalance + price
              : prevUserData.walletBalance,
        };
      });

      getTransactions(); // Refresh the transactions list if needed

      return true;
    } catch (error) {
      console.log("Error cancelling booking:", error);
      return false;
    }
  };

  // Function to scan event
  const scanEvent = async (eventId, userId) => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("eventId", "==", eventId),
        where("userId", "==", userId),
        where("transactionType", "==", "Booking"),
        where("transactionStatus", "==", "Upcoming")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Transaction not found");
        return {
          success: false,
          message: "invalid",
        };
      }

      const transactionDoc = querySnapshot.docs[0];
      const transactionId = transactionDoc.id;
      const transactionData = transactionDoc.data();

      if (transactionData.scanned) {
        return {
          success: false,
          message: "notgranted",
          dateScanned: transactionData.dateScanned,
        };
      }

      // Update the transaction status to "Scanned"
      await updateDoc(doc(db, "transactions", transactionId), {
        scanned: true,
        dateScanned: serverTimestamp(),
      });

      return {
        success: true,
        message: "granted",
      };
    } catch (error) {
      console.log("Error scanning event:", error);
      return {
        success: false,
        message: "error",
      };
    }
  };

  // Function to get total amount where transactionType is Booking
  const getTotalAmount = async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      const querySnapshot = await getDocs(
        query(transactionsRef, where("transactionType", "==", "Booking"))
      );

      let totalAmount = 0;
      querySnapshot.forEach((doc) => {
        totalAmount += doc.data().transactionAmount;
      });

      return totalAmount;
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  // Function to decrement user's wallet balance and increment credit card balance
  const withdrawAmount = async (amount, name) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.data();
      const userWallet = userData.walletBalance;

      if (amount > userWallet) {
        return {
          success: false,
          message: "Insufficient funds in wallet.",
        };
      }

      // Update user's wallet balance
      await updateDoc(userDocRef, {
        walletBalance: userWallet - amount,
      });

      // Update local state
      setUserData({ ...userData, walletBalance: userWallet - amount });

      // Add withdraw to transactions
      const transactionRef = collection(db, "transactions");
      await addDoc(transactionRef, {
        transactionType: "Withdraw",
        transactionAmount: amount,
        userId: userId,
        createdAt: serverTimestamp(),
      });

      // Get credit card details
      const cardRef = collection(db, "bank");
      const querySnapshot = await getDocs(
        query(cardRef, where("cardHolderName", "==", name))
      );

      if (querySnapshot.empty) {
        return {
          success: false,
          message: "No card linked to this account.",
        };
      }

      const cardDoc = querySnapshot.docs[0];
      const cardData = cardDoc.data();
      const cardId = cardDoc.id;
      const cardAmount = cardData.amount;

      // Update credit card balance
      await updateDoc(doc(db, "bank", cardId), {
        amount: cardAmount + amount,
      });

      sendNotification(
        "Withdrawal",
        `Amount of Rs.${amount} withdrawn successfully.`
      );

      // Update local state for transactions
      getTransactions();

      return {
        success: true,
        message: "Amount withdrawn successfully.",
      };
    } catch (error) {
      console.log("Error withdrawing amount:", error);
      return {
        success: false,
        message: "Error withdrawing amount. Please try again later.",
      };
    }
  };

  // Function to get total events, total media for this user, total completed events, total withdrawn amount, total booking amount, total number of booking
  const getStats = async () => {
    try {
      const eventsRef = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsRef);

      // Total events for this userId
      const totalEvents = eventsSnapshot.docs.filter(
        (doc) => doc.data().organiserId === userId
      ).length;

      // Total media for this userId
      const mediaRef = collection(db, "media");
      const mediaSnapshot = await getDocs(mediaRef);

      const totalMedia = mediaSnapshot.docs.filter(
        (doc) => doc.data().organiserId === userId
      ).length;

      // Total completed events for this userId
      const completedEvents = eventsSnapshot.docs.filter(
        (doc) =>
          doc.data().organiserId === userId &&
          doc.data().datetime.toDate() < new Date()
      ).length;

      // Total withdrawn amount for this userId
      const transactionsRef = collection(db, "transactions");
      const transactionsSnapshot = await getDocs(transactionsRef);

      const totalWithdrawnAmount = transactionsSnapshot.docs
        .filter(
          (doc) =>
            doc.data().userId === userId &&
            doc.data().transactionType === "Withdraw"
        )
        .reduce((acc, doc) => acc + doc.data().transactionAmount, 0);

      // Total booking amount for this userId
      const totalBookingAmount = transactionsSnapshot.docs
        .filter(
          (doc) =>
            doc.data().organiserId === userId &&
            doc.data().transactionType === "Booking"
        )
        .reduce((acc, doc) => acc + doc.data().transactionAmount, 0);

      // Total number of bookings for this userId
      const totalBookings = transactionsSnapshot.docs.filter(
        (doc) =>
          doc.data().organiserId === userId &&
          doc.data().transactionType === "Booking"
      ).length;

      return {
        totalEvents,
        totalMedia,
        completedEvents,
        totalWithdrawnAmount,
        totalBookingAmount,
        totalBookings,
      };
    } catch (error) {
      console.log("Error fetching stats:", error);
      return {
        success: false,
        message: "Error fetching stats. Please try again later.",
      };
    }
  };

  // Function to edit event
  const editEvent = async (eventId, updatedEvent) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, updatedEvent);

      // Update local state for organiserEvent
      setUserData((prevUserData) => {
        const updatedEvents = prevUserData.organiserEvents.map((event) =>
          event.id === eventId ? { ...event, ...updatedEvent } : event
        );
        return { ...prevUserData, organiserEvents: updatedEvents };
      });

      return true;
    } catch (error) {
      console.log("Error editing event:", error);
      return false;
    }
  };

  // Function to add event
  const addEvent = async (event) => {
    try {
      const eventRef = collection(db, "events");
      await addDoc(eventRef, event);

      return true;
    } catch (error) {
      console.log("Error adding event:", error);
      return false;
    }
  };

  // const addBank = async () => {
  //   const bankRef = collection(db, "bank");
  //   const secretKey = "A1d4h8e5e5s19h8.";

  //   // Array of card details
  //   const cards = [
  //     {
  //       cardHolderName: "JOHN DOE",
  //       cardNumber: "4111111111111111",
  //       expiryDate: { month: "12", year: "24" },
  //       cvv: "123",
  //       bankName: "Mauritius Bank",
  //       amount: 0,
  //     },
  //     {
  //       cardHolderName: "JANE SMITH",
  //       cardNumber: "4222222222222222",
  //       expiryDate: { month: "11", year: "23" },
  //       cvv: "456",
  //       bankName: "Mauritius Bank",
  //       amount: 2000,
  //     },
  //     {
  //       cardHolderName: "ALICE JOHNSON",
  //       cardNumber: "4333333333333333",
  //       expiryDate: { month: "10", year: "22" },
  //       cvv: "789",
  //       bankName: "Mauritius Bank",
  //       amount: 1500,
  //     },
  //     {
  //       cardHolderName: "BOB BROWN",
  //       cardNumber: "4444444444444444",
  //       expiryDate: { month: "9", year: "25" },
  //       cvv: "012",
  //       bankName: "Mauritius Bank",
  //       amount: 2500,
  //     },
  //     {
  //       cardHolderName: "CHARLIE DAVIS",
  //       cardNumber: "4555555555555555",
  //       expiryDate: { month: "8", year: "26" },
  //       cvv: "345",
  //       bankName: "Mauritius Bank",
  //       amount: 10000,
  //     },
  //   ];

  //   // Encrypt and add each card to Firestore
  //   for (const card of cards) {
  //     const encryptedCardNumber = encryptData(card.cardNumber, secretKey);
  //     const encryptedCvv = encryptData(card.cvv, secretKey);

  //     await addDoc(bankRef, {
  //       cardHolderName: card.cardHolderName,
  //       cardNumber: encryptedCardNumber,
  //       expiryDate: card.expiryDate,
  //       cvv: encryptedCvv,
  //       bankName: card.bankName,
  //       amount: card.amount,
  //     });
  //   }
  // };

  // const addEvent = async () => {
  //   const eventRef = collection(db, "events");

  //   // Music Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Fromania4.jpg?alt=media&token=c244cf83-840c-4051-b18b-504a468fdd50",
  //     name: "Rock Concert Night",
  //     details:
  //       "A high-energy extravaganza featuring local and international rock bands, promising an unforgettable night under the stars.",
  //     datetime: new Date("2024-07-05T19:30:00"),
  //     location: "Pamplemousses Botanical Garden, Pamplemousses",
  //     coordinates: { longitude: 57.580097, latitude: -20.105396 },
  //     category: "Music",
  //     attending: 750,
  //     max_attendees: 5000,
  //     price: "Free",
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Ffeatured2.jpg?alt=media&token=0281ab0f-7020-4943-9437-386ccfdf6c15",
  //     name: "Classical Music Recital",
  //     details:
  //       "Immerse yourself in the elegance of classical music with virtuoso performances in a stunning waterfront setting.",
  //     datetime: new Date("2024-07-12T18:00:00"),
  //     location: "Zilwa Attitude Hotel, Grand Gaube, Rivière du Rempart",
  //     coordinates: { longitude: 57.647438, latitude: -20.002976 },
  //     category: "Music",
  //     attending: 500,
  //     max_attendees: 5000,
  //     price: 2000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Ffeatured1.jpg?alt=media&token=feed63ee-fe30-4909-9446-3f8434b782a2",
  //     name: "EDM Festival",
  //     details:
  //       "Experience the thrill of electronic dance music with top DJs and a spectacular light show at this electrifying event.",
  //     datetime: new Date("2024-08-20T22:00:00"),
  //     location: "Mon Choisy Beach, Grand Baie, Rivière du Rempart",
  //     coordinates: { longitude: 57.557296, latitude: -20.015686 },
  //     category: "Music",
  //     attending: 1000,
  //     max_attendees: 5000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2FLOST-MYMEDIA-244.jpg?alt=media&token=04c642f4-c4d8-4467-8d5f-b5bd7a53768e",
  //     name: "Acoustic Open Mic Night",
  //     details:
  //       "Enjoy an intimate evening of live music with talented local artists showcasing their skills in an acoustic setting.",
  //     datetime: new Date("2024-07-28T20:00:00"),
  //     location: "Recif Attitude Hotel, Pointe aux Piments, Rivière du Rempart",
  //     coordinates: { longitude: 57.522151, latitude: -20.055584 },
  //     category: "Music",
  //     attending: 300,
  //     max_attendees: 5000,
  //     price: 2500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });

  //   // Art Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2F160217-6149-museum-visitors-960x640.webp?alt=media&token=6d12737b-d981-4823-94ba-70b6bf2941aa",
  //     name: "Sculpture Exhibition",
  //     details:
  //       "Discover the beauty of sculptural art with a diverse collection of contemporary and traditional sculptures from local and international artists.",
  //     datetime: new Date("2024-09-07T10:00:00"),
  //     location: "Shay Hewett Gallery, Grand Baie, Rivière du Rempart",
  //     coordinates: { longitude: 57.582884, latitude: -20.014893 },
  //     category: "Art",
  //     max_attendees: 2000,
  //     attending: 400,
  //     price: 2000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2FAMG_Horizontal_1655846346.webp?alt=media&token=bbe77747-55e9-42f0-b9e2-d5995ef369f8",
  //     name: "Street Art Festival",
  //     details:
  //       "Experience the vibrant world of street art with live graffiti demonstrations, interactive installations, and urban art workshops.",
  //     datetime: new Date("2024-07-14T12:00:00"),
  //     location: "Gallery Degav, Grand Baie, Rivière du Rempart",
  //     coordinates: { longitude: 57.582884, latitude: -20.014893 },
  //     category: "Art",
  //     attending: 600,
  //     max_attendees: 2000,
  //     price: 2500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2FMedia_935721_smxx.jpg?alt=media&token=ccd62264-97ca-45aa-8217-80a944a3daf9",
  //     name: "Watercolor Painting Workshop",
  //     details:
  //       "Unleash your creativity with a hands-on watercolor painting workshop led by professional artists in a picturesque garden setting.",
  //     datetime: new Date("2024-08-21T14:00:00"),
  //     location: "Glass Gallery, Vacoas-Phoenix, Plaines Wilhems",
  //     coordinates: { longitude: 57.499854, latitude: -20.27474 },
  //     category: "Art",
  //     attending: 200,
  //     max_attendees: 2000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2FMorrisseau-Collection-Update-Magazine-Header.png?alt=media&token=5b576cd1-4858-4202-9d0d-706e96397cc3",
  //     name: "Photography Exhibition",
  //     details:
  //       "Explore the world through the lens of talented photographers, showcasing stunning landscapes, portraits, and abstract compositions.",
  //     datetime: new Date("2024-09-29T11:00:00"),
  //     location: "Ananta Art Gallery, Pointe aux Piments, Pamplemousses",
  //     coordinates: { longitude: 57.519944, latitude: -20.066553 },
  //     category: "Art",
  //     attending: 350,
  //     max_attendees: 2000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });

  //   // Food Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2F1440x810_cmsv2_bc594186-8ff2-5815-b4b4-c9b46d45142b-7616158.webp?alt=media&token=d1f8e91a-0cf6-4b0a-aac1-1a4f0dafdf27",
  //     name: "Taste of the World Festival",
  //     details:
  //       "Embark on a culinary journey with a diverse selection of international cuisines, live cooking demonstrations, and food tasting experiences.",
  //     datetime: new Date("2024-07-10T17:00:00"),
  //     location: "Kendra Saint Pierre, Moka",
  //     coordinates: { longitude: 57.538322, latitude: -20.225503 },
  //     category: "Food",
  //     attending: 800,
  //     max_attendees: 3000,
  //     price: 800,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2FFood-Festival.jpg?alt=media&token=1bfac0f3-60d0-46da-80f9-d39063655686",
  //     name: "Gourmet Cooking Class",
  //     details:
  //       "Learn the art of gourmet cooking from top chefs, with hands-on lessons, expert tips, and a delicious meal to enjoy at the end of the class.",
  //     datetime: new Date("2024-07-16T15:00:00"),
  //     location: "Bagatelle Mall, Moka",
  //     coordinates: { longitude: 57.496815, latitude: -20.225307 },
  //     category: "Food",
  //     attending: 250,
  //     max_attendees: 3000,
  //     price: "Free",
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2Fimage.jpg?alt=media&token=607d9e62-4016-491b-ab66-400bae27f268",
  //     name: "Wine Tasting Event",
  //     details:
  //       "Indulge in a sophisticated evening of wine tasting, featuring a selection of fine wines, gourmet cheese pairings, and live music in an elegant setting.",
  //     datetime: new Date("2024-08-24T19:00:00"),
  //     location: "Vivea Business Park, Saint Pierre, Moka",
  //     coordinates: { longitude: 57.531018, latitude: -20.223665 },
  //     category: "Food",
  //     attending: 500,
  //     max_attendees: 3000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2FCapture.jpg?alt=media&token=6da2d025-325b-4014-8f6b-2947d3144f0f",
  //     name: "Street Food Fair",
  //     details:
  //       "Savor the flavors of the island with a vibrant street food fair, featuring local delicacies, live music, and cultural performances.",
  //     datetime: new Date("2024-07-30T12:00:00"),
  //     location: "Super U, Centre de Flacq, Flacq",
  //     coordinates: { longitude: 57.723165, latitude: -20.18405 },
  //     category: "Food",
  //     attending: 450,
  //     max_attendees: 3000,
  //     price: 1000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });

  //   // Sports Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2Fnba_800_x_320.jpg?alt=media&token=7e07c3f8-d4c3-47d5-9533-bd25addfae42",
  //     name: "Basketball Game",
  //     details:
  //       "Cheer on your favorite teams in an action-packed basketball game, with thrilling dunks, three-pointers, and fast-paced gameplay.",
  //     datetime: new Date("2024-08-07T19:00:00"),
  //     location: "The Vale Stadium, Pamplemousses",
  //     coordinates: { longitude: 57.598724, latitude: -20.031739 },
  //     category: "Sports",
  //     attending: 1500,
  //     max_attendees: 4000,
  //     price: "Free",
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2Ff99fda77-24fc-4712-9dba-9b05dc12ad50.jpg?alt=media&token=421ced59-f204-43da-8b57-369978db0932",
  //     name: "Marathon",
  //     details:
  //       "Join runners from around the globe in this challenging yet scenic marathon course through picturesque Mauritian landscapes.",
  //     datetime: new Date("2024-07-13T08:00:00"),
  //     location: "Anjalay Stadium, Mapou, Pamplemousses",
  //     coordinates: { longitude: 57.600431, latitude: -20.078611 },
  //     category: "Sports",
  //     attending: 2000,
  //     max_attendees: 4000,
  //     price: 800,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2F3.jpg?alt=media&token=94596bc2-fdbc-42a3-9670-819fb9723f87",
  //     name: "Tennis Tournament",
  //     details:
  //       "Witness top tennis players battle it out on the court in a thrilling tournament featuring intense matches and exciting rallies.",
  //     datetime: new Date("2024-08-21T10:00:00"),
  //     location: "Terre Rouge Tennis Club, Pamplemousses",
  //     coordinates: { longitude: 57.534559, latitude: -20.12679 },
  //     category: "Sports",
  //     attending: 1000,
  //     max_attendees: 4000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2Fstadium.jpg?alt=media&token=750682e5-cf9f-40c5-b48b-857d1dee37a2",
  //     name: "Soccer Match",
  //     details:
  //       "Experience the excitement of a live soccer match with passionate fans, skilled players, and intense competition on the field.",
  //     datetime: new Date("2024-09-28T15:30:00"),
  //     location: "Sir Gaetan Duval, Rose Hill, Plaines Wilhems",
  //     coordinates: { longitude: 57.476639, latitude: -20.246519 },
  //     category: "Sports",
  //     attending: 1800,
  //     max_attendees: 4000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });

  //   // Technology Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2Fstartup-pitch-competition.jpg?alt=media&token=9d3f890a-ac14-4972-8ca1-d97dde1ed29b",
  //     name: "Startup Pitch Competition",
  //     details:
  //       "Watch aspiring entrepreneurs pitch their innovative ideas to a panel of judges, with cash prizes and networking opportunities up for grabs.",
  //     datetime: new Date("2024-07-05T14:00:00"),
  //     location: "Rogers Capital, Port Louis",
  //     coordinates: { longitude: 57.500748, latitude: -20.161949 },
  //     category: "Technology",
  //     attending: 500,
  //     max_attendees: 2000,
  //     price: 2000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2FBlockchain_Futurist_Conference-Toronto-August_2023-P_Coinabse_Handout-1920x1280-.jpg?alt=media&token=c2169ba8-ccdc-4b01-9b48-67cc442323e8",
  //     name: "Blockchain Conference",
  //     details:
  //       "Explore the latest trends and developments in blockchain technology with expert speakers, interactive workshops, and networking sessions.",
  //     datetime: new Date("2024-08-11T09:30:00"),
  //     location: "Accenture, Quatre Bornes, Plaines Wilhems",
  //     coordinates: { longitude: 57.487436, latitude: -20.242357 },
  //     category: "Technology",
  //     attending: 1200,
  //     max_attendees: 2000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2FVD4LVZQ4WNPLXALIA7C3FPVQBU.jpg?alt=media&token=90698926-039e-44ba-b19d-9881c45eb32a",
  //     name: "AI Summit",
  //     details:
  //       "Discover the future of artificial intelligence with industry experts, live demonstrations, and discussions on the impact of AI on society.",
  //     datetime: new Date("2024-09-19T10:00:00"),
  //     location: "2Cana Solutions, Cascavelle, Rivière Noire / Black River",
  //     coordinates: { longitude: 57.405128, latitude: -20.272854 },
  //     category: "Technology",
  //     attending: 800,
  //     max_attendees: 2000,
  //     price: 800,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2F1574497686678_G2H2GAB5L.1-2.jpg?alt=media&token=a9c8241b-019e-493d-8473-10179516122d",
  //     name: "Virtual Reality Showcase",
  //     details:
  //       "Step into the world of virtual reality with immersive experiences, interactive demos, and cutting-edge VR technology at this showcase event.",
  //     datetime: new Date("2024-07-26T13:00:00"),
  //     location: "Caudan Waterfront, Port Louis",
  //     coordinates: { longitude: 57.498134, latitude: -20.1607 },
  //     category: "Technology",
  //     attending: 700,
  //     max_attendees: 2000,
  //     price: 1000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2FFestival%2520Packing-2023_colin-lloyd-eiQqGBAMgIE-unsplash.webp?alt=media&token=f0590f2f-7281-4716-8fd8-6a4fca55e350",
  //     name: "Summer Music Festival",
  //     details:
  //       "Celebrate the season with a music festival featuring live performances, food stalls, and a festive atmosphere for music lovers of all ages.",
  //     datetime: new Date("2024-08-15T17:00:00"),
  //     location: "Trou aux Biches Golf Resort & Spa, Pamplemousses",
  //     coordinates: { longitude: 57.546338, latitude: -20.032702 },
  //     category: "Music",
  //     attending: 1200,
  //     max_attendees: 3000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2Fimage%20(1).jpg?alt=media&token=30cfb415-6511-4bd7-a3d1-220c0e87acdd",
  //     name: "Graffiti Art Workshop",
  //     details:
  //       "Learn the art of graffiti from local street artists, with hands-on workshops, spray painting techniques, and a collaborative mural project.",
  //     datetime: new Date("2024-07-10T13:00:00"),
  //     location: "Didus Art Gallery, Port Louis",
  //     coordinates: { longitude: 57.498415, latitude: -20.159422 },
  //     category: "Art",
  //     attending: 250,
  //     max_attendees: 1000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2Fsff-fb.jpg?alt=media&token=62bd812d-91eb-4d03-90b6-1eeb757a5810",
  //     name: "Street Food Fiesta",
  //     details:
  //       "Experience the flavors of the world with a street food fiesta featuring a variety of international cuisines, live music, and cultural performances.",
  //     datetime: new Date("2024-07-20T18:00:00"),
  //     location: "Street Food, Beau Bassin, Plaines Wilhems",
  //     coordinates: { longitude: 57.470231, latitude: -20.194368 },
  //     category: "Food",
  //     attending: 700,
  //     max_attendees: 2000,
  //     price: 800,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2Fgolden-state-playing-the-portland-trail-blazers-44756.jpg?alt=media&token=a2194166-5fc5-45d7-9fdd-3a6573597b97",
  //     name: "Basketball Skills Camp",
  //     details:
  //       "Improve your basketball skills with expert coaching, drills, and scrimmages at this intensive skills camp for players of all levels.",
  //     datetime: new Date("2024-08-08T09:00:00"),
  //     location: "Gros Cailloux Village Hall, Rivière Noire / Black River",
  //     coordinates: { longitude: 57.437661, latitude: -20.209836 },
  //     category: "Sports",
  //     attending: 400,
  //     max_attendees: 2000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2F2240412.jpg?alt=media&token=9a3fe65b-b3e3-4433-8255-61c86a83484d",
  //     name: "Robotics Expo",
  //     details:
  //       "Experience the cutting-edge world of robotics with live demonstrations, interactive exhibits, and hands-on workshops for all ages.",
  //     datetime: new Date("2024-07-25T11:00:00"),
  //     location: "Elca Mauritius, Saint Pierre",
  //     coordinates: { longitude: 57.536443, latitude: -20.226061 },
  //     category: "Technology",
  //     attending: 900,
  //     max_attendees: 5000,
  //     price: 1000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2F0045_March-18-2023_2223_-Atmosphere_Aaron_Rogosin_Kx5.jpg?alt=media&token=09be8d5e-787d-421e-9ec6-baca6724c4e3",
  //     name: "Disco Night",
  //     details:
  //       "Dance the night away at a retro disco party featuring classic hits, disco balls, and funky dance moves for a groovy night of fun.",
  //     datetime: new Date("2024-06-28T20:00:00"),
  //     location: "Music Coaching Centre, Triolet",
  //     coordinates: { longitude: 57.54915, latitude: -20.070242 },
  //     category: "Music",
  //     attending: 3000,
  //     max_attendees: 3000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FArt%2Fslider-2.jpg?alt=media&token=1de722cd-32ce-4379-95a1-198604d30c04",
  //     name: "Abstract Art Exhibition",
  //     details:
  //       "Explore the world of abstract art with a diverse collection of paintings, sculptures, and installations by contemporary artists.",
  //     datetime: new Date("2024-07-12T10:00:00"),
  //     location: "IIha do Cirne, Point aux Canonniers",
  //     coordinates: { longitude: 57.556709, latitude: -20.005922 },
  //     category: "Art",
  //     attending: 300,
  //     max_attendees: 1000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FSports%2FLanzarote-International-Marathon-European-Sports-Destination6_LD.jpg?alt=media&token=35edc062-96a0-4ab9-aa36-d7ac28d31518",
  //     name: "Fitness Marathon",
  //     details:
  //       "Join fellow fitness enthusiasts in a challenging marathon course designed to test your endurance, strength, and mental toughness.",
  //     datetime: new Date("2024-09-11T07:00:00"),
  //     location: "Soul Space Yoga, Grand Baie",
  //     coordinates: { longitude: 57.558204, latitude: -20.003849 },
  //     category: "Sports",
  //     attending: 1500,
  //     max_attendees: 3000,
  //     price: 500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FTechnology%2Ffeaturedimage_eventsforstartups-e1701268834337.jpg?alt=media&token=53fe1641-6f5f-4509-ad74-11e702ebcc2e",
  //     name: "Tech Startup Mixer",
  //     details:
  //       "Connect with fellow entrepreneurs, investors, and tech enthusiasts at this networking event designed to foster collaboration and innovation.",
  //     datetime: new Date("2024-07-24T18:30:00"),
  //     location: "University of Technology, Pointe aux Sables, Port Louis",
  //     coordinates: { longitude: 57.466813, latitude: -20.176544 },
  //     category: "Technology",
  //     attending: 600,
  //     max_attendees: 2000,
  //     price: "Free",
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FFood%2F1650549340_lead-iihm.jpg?alt=media&token=fab1c83d-c869-4f6d-b667-70fdca23bfad",
  //     name: "International Cuisine Festival",
  //     details:
  //       "Sample a world of flavors at this international cuisine festival, featuring dishes from around the globe, cooking demonstrations, and cultural performances.",
  //     datetime: new Date("2024-08-22T12:00:00"),
  //     location: "Lux Grand Gaube Coastal Road, Grand Gaube",
  //     coordinates: { longitude: 57.659805, latitude: -20.002221 },
  //     category: "Food",
  //     attending: 800,
  //     max_attendees: 1000,
  //     price: 1000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  // };

  // const addEvent = async () => {
  //   const eventRef = collection(db, "events");

  //   // Music Events
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Fromania4.jpg?alt=media&token=c244cf83-840c-4051-b18b-504a468fdd50",
  //     name: "Rock Concert Night",
  //     details:
  //       "A high-energy extravaganza featuring local and international rock bands, promising an unforgettable night under the stars.",
  //     datetime: new Date("2024-07-05T19:30:00"),
  //     location: "Pamplemousses Botanical Garden, Pamplemousses",
  //     coordinates: { longitude: 57.580097, latitude: -20.105396 },
  //     category: "Music",
  //     attending: 750,
  //     max_attendees: 5000,
  //     price: "Free",
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Ffeatured2.jpg?alt=media&token=0281ab0f-7020-4943-9437-386ccfdf6c15",
  //     name: "Classical Music Recital",
  //     details:
  //       "Immerse yourself in the elegance of classical music with virtuoso performances in a stunning waterfront setting.",
  //     datetime: new Date("2024-07-12T18:00:00"),
  //     location: "Zilwa Attitude Hotel, Grand Gaube, Rivière du Rempart",
  //     coordinates: { longitude: 57.647438, latitude: -20.002976 },
  //     category: "Music",
  //     attending: 500,
  //     max_attendees: 5000,
  //     price: 2000,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2Ffeatured1.jpg?alt=media&token=feed63ee-fe30-4909-9446-3f8434b782a2",
  //     name: "EDM Festival",
  //     details:
  //       "Experience the thrill of electronic dance music with top DJs and a spectacular light show at this electrifying event.",
  //     datetime: new Date("2024-08-20T22:00:00"),
  //     location: "Mon Choisy Beach, Grand Baie, Rivière du Rempart",
  //     coordinates: { longitude: 57.557296, latitude: -20.015686 },
  //     category: "Music",
  //     attending: 1000,
  //     max_attendees: 5000,
  //     price: 1500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  //   await addDoc(eventRef, {
  //     image:
  //       "https://firebasestorage.googleapis.com/v0/b/idyllic-silicon-410004.appspot.com/o/events%2FMusic%2FLOST-MYMEDIA-244.jpg?alt=media&token=04c642f4-c4d8-4467-8d5f-b5bd7a53768e",
  //     name: "Acoustic Open Mic Night",
  //     details:
  //       "Enjoy an intimate evening of live music with talented local artists showcasing their skills in an acoustic setting.",
  //     datetime: new Date("2024-07-28T20:00:00"),
  //     location: "Recif Attitude Hotel, Pointe aux Piments, Rivière du Rempart",
  //     coordinates: { longitude: 57.522151, latitude: -20.055584 },
  //     category: "Music",
  //     attending: 300,
  //     max_attendees: 5000,
  //     price: 2500,
  //     organiserId: "WmSSgUZvGafzdEqRRWbDEu9p5NL2",
  //   });
  // };

  const value = {
    token,
    isLoggedIn,
    authenticate,
    logout,
    userId,
    addUser,
    getUserData,
    setUpPushNotifications,
    userData,
    homeLoaded,
    setHomeLoaded,
    userImage,
    checkUser,
    getAllCategories,
    updateUserCategories,
    getEventsForUser,
    toggleView,
    listView,
    setListView,
    myLatitude,
    myLongitude,
    setMyLatitude,
    setMyLongitude,
    isLocationAvailable,
    setIsLocationAvailable,
    likeEvent,
    unlikeEvent,
    selectedCategories,
    setSelectedCategories,
    selectedDateRange,
    setSelectedDateRange,
    priceRange,
    setPriceRange,
    filteredEvents,
    setFilteredEvents,
    updateProfile,
    deleteProfilePicture,
    addCard,
    removeCard,
    retrieveCard,
    addAmount,
    checkAmount,
    getTransactions,
    setTransactions,
    transactions,
    addBooking,
    cancelBooking,
    scanEvent,
    getAllMedia,
    addMedia,
    deleteMedia,
    getOrganiserData,
    getUserNotifications,
    markNotificationAsRead,
    media,
    sendNotification,
    userNotifications,
    updateEventDateTime,
    handleNotificationStatus,
    getTotalAmount,
    withdrawAmount,
    getStats,
    editEvent,
    addEvent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ModalError
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          logout();
        }}
        title="Oops, Error!"
        message="Error getting your data. Please log in again."
      />
    </AuthContext.Provider>
  );
};

export { AuthContextProvider };
