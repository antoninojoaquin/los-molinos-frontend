// El catálogo es un archivo estático que se genera en cada build (scripts/build-catalog.mjs).
// Los visitantes no leen Firestore: no gastan lecturas ni funciones de Cloudflare.
//
// index.html lo precarga en paralelo con el JavaScript. Se pide una sola vez por visita y se reutiliza
// (portada, destacados, catálogo y carrito). El servidor lo manda con Cache-Control: no-cache, así que
// el navegador igual pregunta si cambió: después de publicar, la próxima visita ya ve lo nuevo.
let pending = null;

export const fetchProducts = () => {
  pending ??= fetch("/catalog.json")
    .then(async (response) => {
      if (!response.ok) throw new Error(`catalog.json respondió ${response.status}`);
      return (await response.json()).products;
    })
    .catch((error) => {
      pending = null; // si falló, el próximo intento vuelve a pedirlo
      throw error;
    });
  return pending;
};
