import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTAnVU_TdNmSmas5V2TY5J6nBYuroa_pI",
  authDomain: "fonteyn-evangelical-church.firebaseapp.com",
  projectId: "fonteyn-evangelical-church",
  storageBucket: "fonteyn-evangelical-church.firebasestorage.app",
  messagingSenderId: "996985609085",
  appId: "1:996985609085:web:cd08ddb0c0a9c8ae43ca14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
