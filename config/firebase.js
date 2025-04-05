import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOMaYwLx4ptaAiCaS7ogFOgt0vYbsEdMs",
  authDomain: "maurievent-aeb0c.firebaseapp.com",
  databaseURL:
    "https://maurievent-aeb0c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "maurievent-aeb0c",
  storageBucket: "maurievent-aeb0c.appspot.com",
  messagingSenderId: "805743962337",
  appId: "1:805743962337:web:44b9cfe07dc036db656fa0",
  measurementId: "G-98BN0YYRPL",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// initialize Firebase Auth for that app immediately
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, db, auth, getApp, getAuth, storage };
