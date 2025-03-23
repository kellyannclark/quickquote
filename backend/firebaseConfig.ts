// backend/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyC5xdHQaYwXomfRmNrgXZSo4GDLWc7cLdE",
    authDomain: "quickquote-8e798.firebaseapp.com",
    projectId: "quickquote-8e798",
    storageBucket: "quickquote-8e798.firebasestorage.app",
    messagingSenderId: "1063626636270",
    appId: "1:1063626636270:web:0c8d73c440f4333e62acff"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;