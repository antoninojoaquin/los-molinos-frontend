// El catálogo es un archivo estático que se genera en cada build (scripts/build-catalog.mjs).
// Los visitantes no leen Firestore: no gastan lecturas ni funciones de Cloudflare.
// "no-cache" hace que el navegador pregunte si cambió (respuesta 304 si no): después de publicar se ve al instante.
export const fetchProducts = async () => {
  const response = await fetch("/catalog.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`catalog.json respondió ${response.status}`);
  const { products } = await response.json();
  return products;
};
