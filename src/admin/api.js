// Acceso a Firebase del panel. Vive solo en el chunk de /admin: la tienda no descarga Firebase.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig.js";
import { getImages } from "../utils/image.js";
import { isInStock } from "../utils/stock.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

// meta/catalog guarda cuándo se cambió algo y cuándo se publicó: así el panel sabe si hay cambios sin publicar
const metaRef = doc(db, "meta", "catalog");

export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logOut = () => signOut(auth);

export async function isAdmin(uid) {
  return (await getDoc(doc(db, "admins", uid))).exists();
}

export const MAX_IMAGES = 8;

// Deja solo los campos que acepta firestore.rules. Los documentos viejos (con stock numérico,
// featured o una sola foto en imageUrl) quedan limpios la primera vez que se guardan desde el panel.
const toDoc = (product) => ({
  name: product.name.trim(),
  category: product.category.trim(),
  description: (product.description ?? "").trim(),
  price: Math.round(Number(product.price)),
  inStock: isInStock(product),
  images: getImages(product),
  visible: product.visible !== false,
});

export async function fetchAllProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export async function fetchPublishState() {
  const data = (await getDoc(metaRef)).data() ?? {};
  const updated = data.updatedAt?.toMillis() ?? 0;
  const published = data.publishedAt?.toMillis() ?? 0;
  return { pending: updated > published, publishedAt: data.publishedAt?.toDate() ?? null };
}

// Cada cambio guarda el producto y marca que hay algo sin publicar, en una sola escritura atómica
async function commit(apply) {
  const batch = writeBatch(db);
  apply(batch);
  batch.set(metaRef, { updatedAt: serverTimestamp() }, { merge: true });
  await batch.commit();
}

export const saveProduct = (product) =>
  commit((batch) => {
    const ref = product.id ? doc(db, "products", product.id) : doc(collection(db, "products"));
    batch.set(ref, toDoc(product));
  });

export const deleteProduct = (id) => commit((batch) => batch.delete(doc(db, "products", id)));

// Reemplaza todo el catálogo en una sola escritura atómica: si algo falla, no se borra nada.
// Firestore admite hasta 500 operaciones por escritura.
export async function replaceAllProducts(products) {
  const existing = await getDocs(collection(db, "products"));
  if (existing.size + products.length + 1 > 500) throw new Error("Demasiados productos para una sola importación");
  await commit((batch) => {
    existing.docs.forEach((d) => batch.delete(d.ref));
    products.forEach((p) => batch.set(doc(collection(db, "products")), toDoc(p)));
  });
  return existing.size;
}

async function callApi(path) {
  const response = await fetch(path, {
    method: "POST",
    headers: { authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? `El servidor respondió ${response.status}`);
  return data;
}

// Dispara el build que regenera catalog.json y anota la hora de publicación
export async function publish() {
  await callApi("/api/publish");
  await setDoc(metaRef, { publishedAt: serverTimestamp() }, { merge: true });
}

export const MAX_IMAGE_BYTES = 5_000_000;

// Subida firmada: /api/upload-signature verifica que la sesión sea de un admin y firma;
// después la foto va directo a Cloudinary. Formatos, carpeta y tamaño los define el preset.
export async function uploadImage(file) {
  const signed = await callApi("/api/upload-signature");
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", signed.preset);
  body.append("api_key", signed.apiKey);
  body.append("timestamp", String(signed.timestamp));
  body.append("signature", signed.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message ?? "No se pudo subir la imagen");
  return data.secure_url;
}
