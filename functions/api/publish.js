// Cloudflare Pages Function: dispara un build nuevo (botón "Publicar cambios" del panel) si quien lo pide es admin.
import { handle, publish } from "../../server/admin.js";

export const onRequestPost = async ({ request, env }) => {
  const { status, body } = await handle(() => publish(request.headers.get("authorization"), env));
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
};
