import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

// Solo lo usa el panel de administración: la tienda lee el catálogo de /catalog.json, sin Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
