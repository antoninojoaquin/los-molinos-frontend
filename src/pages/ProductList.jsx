import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import loadingAnimation from "../assets/loading.json";
import cartAnimation from "../assets/shopping-cart.json";
import { useCart } from "../context/cartContext";
import { fetchProducts } from "../services/products";
import { formatPrice } from "../utils/formatPrice";
import { readStorage, writeStorage } from "../utils/storage";
import { getStock } from "../utils/stock";

const FAVORITES_KEY = "favorites";
const LOW_STOCK_THRESHOLD = 2;
const CART_BUTTON_LABELS = ["Agregar al carrito", "Máximo en carrito", "Sin stock"];

export default function ProductList({ showOnlyFavorites = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  const [cooldownId, setCooldownId] = useState(null);
  const cooldownTimeout = useRef(null);
  const { addToCart, getQuantity, syncStock } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        syncStock(data);
      } catch (error) {
        console.error("Error al traer productos:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [syncStock]);

  useEffect(() => () => clearTimeout(cooldownTimeout.current), []);

  const handleAddToCart = (product) => {
    if (!addToCart(product)) return;
    setCooldownId(product.id);
    clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => setCooldownId(null), 2000);
  };

  const toggleFavorite = (productId) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(updatedFavorites);
    writeStorage(FAVORITES_KEY, updatedFavorites);
  };

  const displayedProducts = products.filter(
    (product) => !showOnlyFavorites || favorites.includes(product.id)
  );

  if (loading) {
    return (
      <div className="flex bg-gray-950 justify-center items-center h-128 w-full">
        <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="w-full flex items-center justify-center bg-gray-950 px-6 py-20 min-h-[50vh]">
        <p className="text-white/50 text-xl font-semibold text-center">
          No pudimos cargar los productos. Intentá de nuevo más tarde.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-950 px-6 md:px-16 py-12 min-h-[50vh]">
      {showOnlyFavorites && displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-20 text-white/50">
          <FaHeartBroken className="text-6xl text-orange-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            No tienes nada en favoritos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {displayedProducts.map((product) => {
            const stock = getStock(product);
            const outOfStock = stock <= 0;
            const maxInCart = !outOfStock && getQuantity(product.id) >= stock;
            const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
            const inCooldown = cooldownId === product.id;
            const isFavorite = favorites.includes(product.id);
            const buttonLabel = outOfStock
              ? "Sin stock"
              : maxInCart
                ? "Máximo en carrito"
                : "Agregar al carrito";

            return (
            <article
              key={product.id}
              className="group relative overflow-hidden bg-gray-800 rounded-3xl shadow-lg flex flex-col aspect-[3/4] min-h-80"
            >
              <img
                className={`absolute inset-0 object-cover h-full w-full transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-45% to-transparent" />

              {(outOfStock || lowStock) && (
                <span
                  className={`absolute top-3 left-3 z-10 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shadow
                    ${outOfStock ? "bg-gray-600" : "bg-orange-500"}
                  `}
                >
                  {outOfStock
                    ? "Sin stock"
                    : stock === 1
                      ? "¡Última unidad!"
                      : `¡Últimas ${stock}!`}
                </span>
              )}

              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
                aria-pressed={isFavorite}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:text-orange-300
                  ${isFavorite ? "text-orange-500" : "text-white"}
                `}
              >
                <FaHeart className="text-lg md:text-xl" />
              </button>

              <div className="relative z-10 mt-auto w-full p-3 md:p-4 flex flex-col gap-1">
                <p className="text-orange-300 uppercase tracking-wide text-[10px] md:text-xs truncate">
                  {product.category}
                </p>

                <h3 className="text-white font-bold text-sm md:text-lg leading-tight line-clamp-2 min-h-[2lh]">
                  {product.name}
                </h3>

                <p className="text-white font-extrabold text-lg md:text-2xl mt-1">
                  {formatPrice(product.price)}
                </p>

                <button
                  disabled={inCooldown || outOfStock || maxInCart}
                  onClick={() => handleAddToCart(product)}
                  className={`relative mt-2 w-full text-white text-xs md:text-sm font-semibold px-3 py-2.5 rounded-full transition-colors
                    ${
                      inCooldown
                        ? "bg-gray-500"
                        : outOfStock || maxInCart
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-400 cursor-pointer"
                    }
                  `}
                >
                  {/* Todas las etiquetas ocupan la misma celda: el botón siempre mide lo que la más larga */}
                  <span className="grid justify-items-center">
                    {CART_BUTTON_LABELS.map((label) => (
                      <span
                        key={label}
                        aria-hidden={label !== buttonLabel || inCooldown}
                        className={`[grid-area:1/1] whitespace-nowrap ${
                          label === buttonLabel && !inCooldown ? "" : "invisible"
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </span>

                  {inCooldown && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Lottie
                        animationData={cartAnimation}
                        loop={false}
                        className="w-5 h-5 scale-[2]"
                      />
                    </span>
                  )}
                </button>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </section>
  );
}