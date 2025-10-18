import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Make sure this is imported
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "Replace with your credentials",
    authDomain: "Replace with your credentials",
    projectId: "Replace with your credentials",
    storageBucket: "Replace with your credentials",
    messagingSenderId: "Replace with your credentials",
    appId: "Replace with your credentials",
    measurementId: "Replace with your credentials"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app);

export { db, storage  };
