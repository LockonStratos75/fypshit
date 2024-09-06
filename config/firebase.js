// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSh0-rk1IRUghtlkqLsdsSSjGOTlsTYjM",
    authDomain: "general-69914.firebaseapp.com",
    projectId: "general-69914",
    storageBucket: "general-69914.appspot.com",
    messagingSenderId: "523123105105",
    appId: "1:523123105105:web:94b5a4563acf5d15ad4770"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const db = getFirestore(app);

export default db;
