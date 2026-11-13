// Acciones del panel que necesitan secretos: firmar subidas a Cloudinary y disparar un nuevo build.
// Las usan las funciones de Cloudflare (functions/api/*) y el servidor de desarrollo (vite.config.js).
// Antes de cada acción se verifica que la sesión de Firebase sea de un admin.
import { firebaseConfig } from "../src/firebaseConfig.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// 1. La sesión de Firebase es válida. 2. Existe admins/{uid}: las reglas solo dejan a cada uno
// leer su propio documento, y ese documento existe solo si es admin.
export async function verifyAdmin(authorization) {
  const idToken = authorization?.replace(/^Bearer /, "") ?? "";
  if (!idToken) throw new HttpError(401, "Falta la sesión");

  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  const uid = lookup.ok ? (await lookup.json()).users?.[0]?.localId : undefined;
  if (!uid) throw new HttpError(401, "Sesión inválida o vencida");

  const admin = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/admins/${uid}`,
    { headers: { authorization: `Bearer ${idToken}` } }
  );
  if (!admin.ok) throw new HttpError(403, "La cuenta no es admin");
}

async function sha1(text) {
  const hash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Firma una subida a Cloudinary. Con el preset en modo "Signed", Cloudinary rechaza las subidas sin firma.
export async function signUpload(authorization, env) {
  await verifyAdmin(authorization);
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new HttpError(500, "Faltan las variables de Cloudinary");
  }

  // SHA-1 de los parámetros ordenados más la clave secreta (formato de Cloudinary)
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha1(
    `timestamp=${timestamp}&upload_preset=${CLOUDINARY_UPLOAD_PRESET}${CLOUDINARY_API_SECRET}`
  );
  return {
    timestamp,
    signature,
    apiKey: CLOUDINARY_API_KEY,
    preset: CLOUDINARY_UPLOAD_PRESET,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
}

// Dispara un build nuevo en Cloudflare Pages: el build regenera catalog.json con los productos.
// La URL del deploy hook es secreta: quien la tenga puede gastar builds de la cuenta.
export async function publish(authorization, env) {
  await verifyAdmin(authorization);
  if (!env.DEPLOY_HOOK_URL) throw new HttpError(500, "Falta DEPLOY_HOOK_URL");

  const response = await fetch(env.DEPLOY_HOOK_URL, { method: "POST" });
  if (!response.ok) throw new HttpError(502, `Cloudflare respondió ${response.status}`);
  return { ok: true };
}

// Respuesta JSON común a las funciones y al servidor de desarrollo
export async function handle(action) {
  try {
    return { status: 200, body: await action() };
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    return { status, body: { error: error.message || "Error" } };
  }
}
