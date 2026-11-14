import { isInStock } from "./stock";

// Búsqueda sin importar mayúsculas ni tildes: "cazuela" encuentra "Cazuela", "tabla" encuentra "Tablas"
export const normalize = (text = "") =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const SORTS = {
  relevance: "Recomendados",
  "price-asc": "Menor precio",
  "price-desc": "Mayor precio",
};

// Los filtros viven en la URL (?q=&cat=&min=&max=&sort=): se pueden compartir y no se pierden al abrir un producto
export function readFilters(searchParams) {
  const number = (key) => {
    const value = Number(searchParams.get(key));
    return searchParams.get(key) && Number.isFinite(value) && value >= 0 ? value : null;
  };
  const sort = searchParams.get("sort");
  return {
    q: searchParams.get("q") ?? "",
    cat: searchParams.get("cat") ?? "",
    min: number("min"),
    max: number("max"),
    sort: sort in SORTS ? sort : "relevance",
  };
}

export const hasActiveFilters = (filters) =>
  !!(filters.q || filters.cat || filters.min != null || filters.max != null || filters.sort !== "relevance");

export function applyFilters(products, { q, cat, min, max, sort }) {
  const words = normalize(q).split(/\s+/).filter(Boolean);

  const filtered = products.filter((product) => {
    if (cat && product.category !== cat) return false;
    if (min != null && product.price < min) return false;
    if (max != null && product.price > max) return false;
    if (!words.length) return true;
    // Todas las palabras tienen que aparecer en el nombre, la categoría o la descripción
    const text = normalize(`${product.name} ${product.category} ${product.description ?? ""}`);
    return words.every((word) => text.includes(word));
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

  // Los productos sin stock siempre van al final (sort es estable: el resto mantiene su orden)
  return filtered.sort((a, b) => isInStock(b) - isInStock(a));
}

// Categorías con su cantidad de productos, en orden alfabético
export function getCategories(products) {
  const counts = {};
  for (const { category } of products) counts[category] = (counts[category] ?? 0) + 1;
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
