// Después del build: una página HTML por producto con su propia vista previa (WhatsApp, Facebook, Google),
// más sitemap.xml y robots.txt. Todo estático: no usa funciones de Cloudflare ni lecturas de Firestore.
//
// WhatsApp y Facebook no ejecutan JavaScript: leen el <head> tal como llega. Por eso cada producto tiene
// su archivo dist/productos/<id>.html (Cloudflare Pages lo sirve en /productos/<id>), que es la misma
// app con el título, la descripción, la foto y los datos del producto ya escritos en el <head>.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSiteUrl } from "../src/siteConfig.js";

const outDir = process.argv[2] ?? "dist";
const site = getSiteUrl(process.env);
const SITE_NAME = "Los Molinos Regionales";

const shell = await readFile(join(outDir, "index.html"), "utf8");
const { products } = JSON.parse(await readFile(join(outDir, "catalog.json"), "utf8"));

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const money = (price) => `$${price.toLocaleString("es-AR")}`;

// Nombre y precio primero; el texto cortado a ~155 caracteres (lo que muestran Google y WhatsApp)
function describe(product) {
  const text = `${product.name} a ${money(product.price)}. ${product.description ?? ""}`.replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 154).replace(/\s+\S*$/, "")}…` : text;
}

// 1200×630 es lo que piden WhatsApp y Facebook: la foto entera, con relleno a los costados.
// b_auto:border toma el color del borde de la foto (el crema), así no se nota la unión
const previewImage = (url) =>
  url?.includes("res.cloudinary.com/")
    ? url.replace("/upload/", "/upload/f_jpg,q_auto,c_pad,b_auto:border,w_1200,h_630/")
    : `${site}/meta.png`;

// Reemplaza una etiqueta del <head>; si no la encuentra, corta el build (mejor que publicar vistas previas rotas)
function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: no se encontró ${pattern} en index.html`);
  return html.replace(pattern, replacement);
}

function productPage(product) {
  const url = `${site}/productos/${product.id}`;
  const title = escapeHtml(`${product.name} | ${SITE_NAME}`);
  const description = escapeHtml(describe(product));
  const image = escapeHtml(previewImage(product.images?.[0]));

  // Datos del producto para Google (precio y disponibilidad en los resultados)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.images,
    url,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ARS",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    },
  };

  let html = shell;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = replaceTag(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="product" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = replaceTag(
    html,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${image}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${escapeHtml(product.name)}" />`
  );
  // "<" escapado para que un texto del producto no pueda cerrar el <script>
  const json = JSON.stringify(structuredData).replace(/</g, "\\u003c");
  return html.replace("</head>", `    <script type="application/ld+json">${json}</script>\n  </head>`);
}

await mkdir(join(outDir, "productos"), { recursive: true });
for (const product of products) {
  await writeFile(join(outDir, "productos", `${product.id}.html`), productPage(product));
}

// sitemap.xml: las páginas principales y cada producto, para que Google los encuentre
const paths = ["/", "/productos", "/ubicacion", ...products.map((p) => `/productos/${p.id}`)];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${site}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
await writeFile(join(outDir, "sitemap.xml"), sitemap);
await writeFile(join(outDir, "robots.txt"), `User-agent: *\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`);

console.log(`prerender: ${products.length} páginas de producto, sitemap.xml y robots.txt (${site})`);
