// Cloudflare Pages Function: firma la subida de una foto a Cloudinary si quien la pide es admin.
// Solo la usa el panel: las visitas a la tienda no ejecutan funciones.
import { handle, signUpload } from "../../server/admin.js";

export const onRequestPost = async ({ request, env }) => {
  const { status, body } = await handle(() => signUpload(request.headers.get("authorization"), env));
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
};
