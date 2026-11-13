// Configuración web de Firebase. Es pública por diseño: lo que protege la base son las reglas
// (firestore.rules). La usan el panel (src/firebase.js) y el script del catálogo (scripts/build-catalog.mjs).
export const firebaseConfig = {
  apiKey: "AIzaSyD2oircj0AHHKBohqhlOoJeGe7xgU5lIdc",
  authDomain: "lmregionales-aaff7.firebaseapp.com",
  projectId: "lmregionales-aaff7",
  storageBucket: "lmregionales-aaff7.firebasestorage.app",
  messagingSenderId: "372781571364",
  appId: "1:372781571364:web:02517d6bdbdbefbdb0a7b1",
};
