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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedProducts.map((product) => {
            const stock = getStock(product);
            const outOfStock = stock <= 0;
            const maxInCart = !outOfStock && getQuantity(product.id) >= stock;
            const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
            const inCooldown = cooldownId === product.id;
            const buttonLabel = outOfStock
              ? "Sin stock"
              : maxInCart
                ? "Máximo en carrito"
                : "Agregar al carrito";

            return (
            <div
              key={product.id}
              className="relative overflow-hidden p-1 md:p-2 bg-gray-800 rounded-3xl shadow flex flex-col h-96"
            >
              <img
                className={`absolute inset-0 object-cover h-full w-full rounded-3xl ${outOfStock ? "grayscale" : ""}`}
                src={product.imageUrl}
                alt={product.name}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />

              {(outOfStock || lowStock) && (
                <span
                  className={`absolute top-3 left-3 z-10 text-white text-[11px] md:text-xs font-semibold uppercase px-3 py-1 rounded-full
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

              <FaHeart
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-2 right-2 text-[40px] z-10 cursor-pointer transition-colors p-2 bg-black/50 rounded-4xl duration-200
                  ${
                    favorites.includes(product.id)
                      ? "hover:text-orange-300 text-orange-500"
                      : "hover:text-orange-300 text-white"
                  }
                `}
              />
              <div className="relative z-10 mt-auto w-full p-2 ">
                <p className="relative z-10 text-orange-300 uppercase mb-2 text-[11px] md:text-xs">
                  {product.category}
                </p>

                <p className="relative z-10 text-white font-bold text-md md:text-xl">
                  {product.name}
                </p>

                <div className="gap-2 flex items-center justify-between mt-auto">
                  <p className="relative z-10 text-white bg-white/30 text-center rounded-full mt-2 py-2 px-1 w-auto">
                    {formatPrice(product.price)}
                  </p>

                  <button
                    disabled={inCooldown || outOfStock || maxInCart}
                    onClick={() => handleAddToCart(product)}
                    className={`relative z-10 mt-2 mb-0.5 text-white text-xs md:text-sm px-3 md:px-6 py-2 border-1 rounded-full transition-colors
                      ${
                        inCooldown
                          ? "bg-gray-500 border-gray-500"
                          : outOfStock || maxInCart
                            ? "bg-gray-600 border-gray-600 cursor-not-allowed"
                            : "bg-orange-500 border-orange-500 hover:bg-orange-400 hover:border-orange-400 cursor-pointer"
                      }
                    `}
                  >
                    {/* Todas las etiquetas ocupan la misma celda: el botón siempre mide lo que la más larga */}
                    <span className="grid">
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
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}