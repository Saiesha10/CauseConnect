// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCl6IJ87wDDrLSBvzgILv1T-_xu1jf_4QA",
    authDomain: "causeconnect-fb3f5.firebaseapp.com",
    projectId: "causeconnect-fb3f5",
    storageBucket: "causeconnect-fb3f5.firebasestorage.app",
    messagingSenderId: "989066201201",
    appId: "1:989066201201:web:ebf09cef4d8db7251f73d0",
    measurementId: "G-6TYV2PHRK6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export both app and auth
export { app, auth };
