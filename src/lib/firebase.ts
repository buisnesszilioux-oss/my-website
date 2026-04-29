import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBoAKGgn_Abb8qADt0u_N_-P0ZzR-vGlOE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "miweb-edaf5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "miweb-edaf5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "miweb-edaf5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "943224981876",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:943224981876:web:c92167e6f873aca4ec0421",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-GVVDEHW5N5",
};

export const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL ?? "miengineering17@gmail.com").toLowerCase();

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
