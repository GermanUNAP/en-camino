import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyAVQ8mJ51nC-sm71u2Y4FVNGroChmOs96A",
  authDomain: "en-camino-777b7.firebaseapp.com",
  projectId: "en-camino-777b7",
  storageBucket: "en-camino-777b7.firebasestorage.app",
  messagingSenderId: "189277511772",
  appId: "1:189277511772:web:94e321d436c56719eb4699",
  measurementId: "G-0QB7J7DQ3Q"
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app); 

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };