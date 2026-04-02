import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAeoR12iRWmHfoO_RaA84_eodWc6kufegk",
  authDomain: "footballapp-9720e.firebaseapp.com",
  projectId: "footballapp-9720e",
  storageBucket: "footballapp-9720e.firebasestorage.app",
  messagingSenderId: "537384529048",
  appId: "1:537384529048:web:40e2f22ba70244696e34ed",
  measurementId: "G-58WRF2SLZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const getFirebaseAuth = () => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
};

export const auth = getFirebaseAuth();
