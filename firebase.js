// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from 'firebase/firestore'
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgnEWOpG8Ma9KkMmE1jiPv7tP4CsneKms",
  authDomain: "inventorymanagement-c3d9e.firebaseapp.com",
  projectId: "inventorymanagement-c3d9e",
  storageBucket: "inventorymanagement-c3d9e.appspot.com",
  messagingSenderId: "762771696080",
  appId: "1:762771696080:web:a1114393428ff7e7c931d5",
  measurementId: "G-G14W0YVGP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Storage (if needed)
const storage = getStorage(app);

export { app, firestore, auth, storage };