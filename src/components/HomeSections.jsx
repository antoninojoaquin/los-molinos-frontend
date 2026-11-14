import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { useFavorites } from "../context/favoritesContext";
import { fetchProducts } from "../services/products";
import { isInStock } from "../utils/stock";

const MAX_FEATURED = 8;

// Destacados: los marcados con la estrella en el panel (primero los que tienen stock).
// Si todavía no hay ninguno marcado, uno con stock de cada categoría, para que la sección no quede vacía.
function pickFeatured(products) {
  const starred = products.filter((p) => p.featured).sort((a, b) => isInStock(b) - isInStock(a));
  if (starred.length) return starred.slice(0, MAX_FEATURED);
  const oneEach = new Map();
  for (const p of products) if (isInStock(p) && !oneEach.has(p.category)) oneEach.set(p.category, p);
  return [...oneEach.values()].slice(0, 4);
}

function SectionTitle({ children, link }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 md:mb-8">
      <h2 className="text-white text-2xl md:text-4xl">{children}</h2>
      {link && (
        <Link to="/productos" className="flex items-center gap-2 shrink-0 font-normal text-stone-400 hover:text-white text-sm md:text-base">
          Ver todos
          <FaArrowRight className="text-xs" />
        </Link>
      )}
    </div>
  );
}

// Sección del inicio debajo de la portada: destacados (las categorías están en la portada).
// Se descargan aparte (lazy) para que la portada siga apareciendo al instante.
export default function HomeSections() {
  const [products, setProducts] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Error al traer productos:", error);
        setProducts([]);
      });
  }, []);

  const featured = products ? pickFeatured(products) : [];

  return (
    <div className="w-full bg-stone-950 px-3 sm:px-6 md:px-16 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
      {featured.length > 0 && (
        <section>
          <SectionTitle link>Destacados</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                to={`/productos/${product.id}`}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
