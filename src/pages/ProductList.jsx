import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import loadingAnimation from "../assets/loading.json";
import AddToCartButton from "../components/AddToCartButton";
import ProductDetail from "../components/ProductDetail";
import { useCart } from "../context/cartContext";
import { fetchProducts } from "../services/products";
import { formatPrice } from "../utils/formatPrice";
import { readStorage, writeStorage } from "../utils/storage";
import { getStock } from "../utils/stock";
import { optimizeImage } from "../utils/image";

const FAVORITES_KEY = "favorites";
const LOW_STOCK_THRESHOLD = 2;

export default function ProductList({ showOnlyFavorites = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  const { syncStock } = useCart();
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = showOnlyFavorites ? "/favoritos" : "/productos";

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

  // Si el detalle se abrió desde la grilla, volver atrás deja el historial limpio.
  // Si se entró por link directo, se reemplaza la URL por la del listado.
  const openedFromList = location.state?.fromList;
  const closeDetail = useCallback(() => {
    if (openedFromList) navigate(-1);
    else navigate(basePath, { replace: true });
  }, [openedFromList, navigate, basePath]);

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

  const selectedProduct = productId && products.find((product) => product.id === productId);

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

  if (productId && !selectedProduct) {
    return <Navigate to={basePath} replace />;
  }

  return (
    <section className="w-full bg-gray-950 px-3 sm:px-6 md:px-16 py-12 min-h-[50vh]">
      {showOnlyFavorites && displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-20 text-white/50">
          <FaHeartBroken className="text-6xl text-orange-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            No tienes nada en favoritos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
          {displayedProducts.map((product) => {
            const stock = getStock(product);
            const outOfStock = stock <= 0;
            const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
            const isFavorite = favorites.includes(product.id);

            return (
            <article
              key={product.id}
              className="group relative overflow-hidden bg-gray-800 rounded-3xl shadow-lg flex flex-col h-80 sm:h-96 xl:h-[28rem]"
            >
              <img
                className={`absolute inset-0 object-cover h-full w-full transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
                src={optimizeImage(product.imageUrl, 800)}
                srcSet={`${optimizeImage(product.imageUrl, 400)} 400w, ${optimizeImage(product.imageUrl, 800)} 800w`}
                sizes="(min-width: 1024px) 25vw, 50vw"
                alt={product.name}
                loading="lazy"
                decoding="async"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-45% to-transparent" />

              {/* Toda la card abre el detalle; favoritos y carrito quedan por encima */}
              <Link
                to={`${basePath}/${product.id}`}
                state={{ fromList: true }}
                aria-label={`Ver detalle de ${product.name}`}
                className="absolute inset-0 z-[5] rounded-3xl focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:-outline-offset-2"
              />

              {(outOfStock || lowStock) && (
                <span
                  className={`absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 max-w-[calc(100%-3.75rem)] truncate text-white text-[11px] md:text-xs font-semibold md:uppercase md:tracking-wide px-2 md:px-2.5 py-1 rounded-full shadow
                    ${outOfStock ? "bg-gray-600" : "bg-orange-500"}
                  `}
                >
                  {outOfStock
                    ? "Sin stock"
                    : stock === 1
                      ? "¡Queda 1!"
                      : `¡Quedan ${stock}!`}
                </span>
              )}

              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
                aria-pressed={isFavorite}
                className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 p-1.5 md:p-2 rounded-full bg-black/55 cursor-pointer transition-colors duration-200 hover:text-orange-300
                  ${isFavorite ? "text-orange-500" : "text-white"}
                `}
              >
                <FaHeart className="text-base md:text-xl" />
              </button>

              <div className="pointer-events-none relative z-10 mt-auto w-full p-3 md:p-4 flex flex-col gap-1">
                <p className="text-orange-300 uppercase tracking-wide text-[10px] md:text-xs truncate">
                  {product.category}
                </p>

                <h3 className="text-white font-bold text-sm md:text-lg leading-tight line-clamp-2 min-h-[2lh]">
                  {product.name}
                </h3>

                <p className="text-white font-extrabold text-lg md:text-2xl mt-1">
                  {formatPrice(product.price)}
                </p>

                <div className="pointer-events-auto mt-2">
                  <AddToCartButton product={product} className="py-2.5 text-xs md:text-sm" />
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={closeDetail} />
      )}
    </section>
  );
}