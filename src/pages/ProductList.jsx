import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import { FaHeart, FaHeartBroken, FaSearch } from "react-icons/fa";
import loadingAnimation from "../assets/loading.json";
import AddToCartButton from "../components/AddToCartButton";
import CatalogFilters from "../components/CatalogFilters";
import ProductDetail from "../components/ProductDetail";
import { useCart } from "../context/cartContext";
import { fetchProducts } from "../services/products";
import { formatPrice } from "../utils/formatPrice";
import { readStorage, writeStorage } from "../utils/storage";
import { isInStock } from "../utils/stock";
import { applyFilters, getCategories, hasActiveFilters, readFilters } from "../utils/catalogFilters";
import { mainImage, optimizeImage } from "../utils/image";
import useDocumentTitle from "../hooks/useDocumentTitle";

const FAVORITES_KEY = "favorites";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  // Al abrir y cerrar un producto se conservan los filtros (?q=&cat=...)
  const listLocation = { pathname: basePath, search: location.search };

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
    else navigate({ pathname: basePath, search: location.search }, { replace: true });
  }, [openedFromList, navigate, basePath, location.search]);

  // Cambia uno o más filtros en la URL; los vacíos se sacan para que quede limpia.
  // replace: escribir en la búsqueda no llena el historial del botón "atrás"
  const updateFilters = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value == null || value === "" || (key === "sort" && value === "relevance")) next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => setSearchParams({}, { replace: true });

  const toggleFavorite = (productId) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(updatedFavorites);
    writeStorage(FAVORITES_KEY, updatedFavorites);
  };

  const baseProducts = products.filter((product) => !showOnlyFavorites || favorites.includes(product.id));
  const displayedProducts = applyFilters(baseProducts, filters);
  const filtersActive = hasActiveFilters(filters);

  const selectedProduct = productId && products.find((product) => product.id === productId);

  useDocumentTitle(
    selectedProduct ? selectedProduct.name : showOnlyFavorites ? "Favoritos" : "Productos"
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

  if (productId && !selectedProduct) {
    return <Navigate to={listLocation} replace />;
  }

  return (
    <section className="w-full bg-gray-950 px-3 sm:px-6 md:px-16 py-12 min-h-[50vh]">
      {showOnlyFavorites && baseProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-12 text-white/50 min-h-[60vh]">
          <FaHeartBroken className="text-6xl text-orange-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            No tenés nada en favoritos
          </p>
        </div>
      ) : (
        <>
        <CatalogFilters
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          categories={getCategories(baseProducts)}
          total={baseProducts.length}
          shown={displayedProducts.length}
          active={filtersActive}
        />
        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-16 text-white/50 text-center">
            <FaSearch className="text-5xl text-orange-500 mb-4" />
            <p className="text-xl font-semibold">No encontramos productos con esos filtros</p>
            <button onClick={clearFilters} className="mt-4 text-orange-400 hover:text-orange-300 cursor-pointer">
              Limpiar filtros
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
          {displayedProducts.map((product) => {
            const outOfStock = !isInStock(product);
            const image = mainImage(product);
            const isFavorite = favorites.includes(product.id);

            return (
            <article
              key={product.id}
              className="group relative overflow-hidden bg-gray-800 rounded-3xl shadow-lg flex flex-col"
            >
              {/* Foto entera (las fotos son cuadradas, con fondo crema): no se recorta ningún producto */}
              <div className="relative aspect-square overflow-hidden bg-photo">
                <img
                  className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale opacity-70" : ""}`}
                  src={optimizeImage(image, 800)}
                  srcSet={`${optimizeImage(image, 400)} 400w, ${optimizeImage(image, 800)} 800w`}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Toda la card abre el detalle; favoritos y carrito quedan por encima */}
              <Link
                to={{ pathname: `${basePath}/${product.id}`, search: location.search }}
                state={{ fromList: true }}
                aria-label={`Ver detalle de ${product.name}`}
                className="absolute inset-0 z-[5] rounded-3xl focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:-outline-offset-2"
              />

              {outOfStock && (
                <span
                  className={`absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 max-w-[calc(100%-3.75rem)] truncate text-white text-[11px] md:text-xs font-semibold md:uppercase md:tracking-wide px-2 md:px-2.5 py-1 rounded-full shadow
                    bg-gray-600
                  `}
                >
                  Sin stock
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

              <div className="pointer-events-none relative z-10 flex-1 w-full p-3 md:p-4 flex flex-col gap-1">
                <p className="text-orange-300 uppercase tracking-wide text-[10px] md:text-xs truncate">
                  {product.category}
                </p>

                <h3 className="text-white font-bold text-sm md:text-lg leading-tight line-clamp-2 min-h-[2lh]">
                  {product.name}
                </h3>

                <p className="text-white font-extrabold text-lg md:text-2xl mt-auto pt-1">
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
        </>
      )}

      {selectedProduct && (
        <ProductDetail key={selectedProduct.id} product={selectedProduct} onClose={closeDetail} />
      )}
    </section>
  );
}