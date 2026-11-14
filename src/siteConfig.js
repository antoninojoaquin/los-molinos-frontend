// Dirección pública de la tienda: la usan los links absolutos de SEO (canonical, vista previa al compartir,
// datos para Google y sitemap). Cuando haya dominio propio, se cambia acá (o con la variable SITE_URL del build).
export const DEFAULT_SITE_URL = "https://lmregionales.com";

export const getSiteUrl = (env = {}) => (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
