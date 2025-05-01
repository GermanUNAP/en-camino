import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAVQ8mJ51nC-sm71u2Y4FVNGroChmOs96A",
  authDomain: "en-camino-777b7.firebaseapp.com",
  projectId: "en-camino-777b7",
  storageBucket: "en-camino-777b7.firebasestorage.app",
  messagingSenderId: "189277511772",
  appId: "1:189277511772:web:94e321d436c56719eb4699",
  measurementId: "G-0QB7J7DQ3Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);