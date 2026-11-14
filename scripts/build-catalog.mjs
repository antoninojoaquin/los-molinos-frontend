// Genera catalog.json con los productos de Firestore. Corre en cada build (npm run build → dist/)
// y a mano para desarrollo (npm run catalog → public/).
//
// Lee con la cuenta lectora (CATALOG_READER_EMAIL y CATALOG_READER_PASSWORD), que las reglas dejan leer
// aunque la colección esté cerrada al público. Sin esas variables intenta leer sin login: sirve solo
// mientras las reglas dejen leer `products` a cualquiera.
//
// Si algo falla, el build falla: mejor no publicar que publicar la tienda sin productos.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { firebaseConfig } from "../src/firebaseConfig.js";

const outDir = process.argv[2] ?? "dist";
const { apiKey, projectId } = firebaseConfig;
const email = process.env.CATALOG_READER_EMAIL;
const password = process.env.CATALOG_READER_PASSWORD;

// Convierte el formato tipado de la API REST de Firestore a valores comunes
function decode(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decode);
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  return null;
}

const decodeFields = (fields = {}) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));

async function login() {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!response.ok) throw new Error(`Login de la cuenta lectora: ${response.status} ${await response.text()}`);
  return (await response.json()).idToken;
}

async function fetchAllProducts(idToken) {
  const headers = idToken ? { authorization: `Bearer ${idToken}` } : {};
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`;
  const documents = [];
  let pageToken = "";

  do {
    const url = `${base}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Firestore respondió ${response.status}: ${await response.text()}`);
    const page = await response.json();
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);

  const all = documents.map((doc) => {
    // stock (numérico viejo), featured (nunca se usó) e imageUrl (una sola foto, formato viejo) no llegan a la tienda
    const { stock, inStock, featured, imageUrl, images, ...data } = decodeFields(doc.fields);
    return {
      hidden: data.visible === false,
      id: doc.name.split("/").pop(),
      ...data,
      // Mismo criterio que getImages (src/utils/image.js): la lista nueva, o la foto única vieja
      images: images?.length ? images : imageUrl ? [imageUrl] : [],
      // Mismo criterio que src/utils/stock.js: booleano nuevo, o el stock numérico viejo, o disponible
      inStock: inStock ?? (stock == null || stock > 0),
    };
  });
  // Los productos ocultos desde el panel no llegan a la tienda (ni a las páginas de producto ni al sitemap)
  const published = all.filter((p) => !p.hidden).map(({ hidden, visible, ...product }) => product);
  if (all.length > published.length) console.log(`catalog: ${all.length - published.length} productos ocultos no se publican`);
  return published;
}

if (!email || !password) {
  console.warn("catalog: sin CATALOG_READER_EMAIL/PASSWORD, se intenta leer Firestore sin login");
}

const products = await fetchAllProducts(email && password ? await login() : null);
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "catalog.json"), JSON.stringify({ products }));
console.log(`catalog: ${products.length} productos → ${join(outDir, "catalog.json")}`);
