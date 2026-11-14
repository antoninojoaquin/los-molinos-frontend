import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import useFavorites from "../hooks/useFavorites";
import { fetchProducts } from "../services/products";
import { getCategories } from "../utils/catalogFilters";
import { mainImage, optimizeImage } from "../utils/image";
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

// Foto de cada categoría: la de un producto destacado de esa categoría, o la del primero con stock
function categoryImage(products, category) {
  const inCategory = products.filter((p) => p.category === category);
  const pick = inCategory.find((p) => p.featured) ?? inCategory.find(isInStock) ?? inCategory[0];
  return pick && mainImage(pick);
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

// Secciones del inicio debajo de la portada: destacados y categorías.
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

  const categories = products ? getCategories(products) : [];
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

      {categories.length > 0 && (
        <section>
          <SectionTitle>Categorías</SectionTitle>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-5">
            {categories.map(({ name, count }) => {
              const image = categoryImage(products, name);
              return (
                <Link
                  key={name}
                  to={{ pathname: "/productos", search: `?cat=${encodeURIComponent(name)}` }}
                  className="group rounded-2xl overflow-hidden bg-stone-900 flex flex-col focus-visible:outline-2 focus-visible:outline-orange-400"
                >
                  <div className="aspect-square bg-photo overflow-hidden">
                    {image && (
                      <img
                        src={optimizeImage(image, 400)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-2.5 md:p-4 flex-1">
                    <p className="text-stone-100 font-semibold text-xs sm:text-sm md:text-base leading-tight group-hover:text-orange-400 transition-colors">{name}</p>
                    <p className="text-stone-500 text-[11px] sm:text-sm mt-0.5">
                      {count} {count === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
