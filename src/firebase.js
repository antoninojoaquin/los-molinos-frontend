import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2oircj0AHHKBohqhlOoJeGe7xgU5lIdc",
  authDomain: "lmregionales-aaff7.firebaseapp.com",
  projectId: "lmregionales-aaff7",
  storageBucket: "lmregionales-aaff7.firebasestorage.app",
  messagingSenderId: "372781571364",
  appId: "1:372781571364:web:02517d6bdbdbefbdb0a7b1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
