import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaHeartBroken, FaSearch } from "react-icons/fa";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import { useFavorites } from "../context/favoritesContext";
import CatalogFilters from "../components/CatalogFilters";
import ProductDetail from "../components/ProductDetail";
import { useCart } from "../context/cartContext";
import { fetchProducts } from "../services/products";
import { applyFilters, getCategories, hasActiveFilters, readFilters } from "../utils/catalogFilters";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function ProductList({ showOnlyFavorites = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();
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

  const baseProducts = products.filter((product) => !showOnlyFavorites || favorites.includes(product.id));
  const displayedProducts = applyFilters(baseProducts, filters);
  const filtersActive = hasActiveFilters(filters);

  const selectedProduct = productId && products.find((product) => product.id === productId);

  useDocumentTitle(
    selectedProduct ? selectedProduct.name : showOnlyFavorites ? "Favoritos" : "Productos"
  );

  // Esqueleto con el mismo tamaño que el catálogo real: al llegar los productos no salta nada
  if (loading) {
    return (
      <section aria-busy="true" aria-label="Cargando productos" className="w-full bg-stone-950 px-3 sm:px-6 md:px-16 py-12 min-h-[50vh]">
        <div className="h-[8.5rem] md:h-[7.25rem] mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full flex items-center justify-center bg-stone-950 px-6 py-20 min-h-[50vh]">
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
    <section className="w-full bg-stone-950 px-3 sm:px-6 md:px-16 py-12 min-h-[50vh]">
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
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
              to={{ pathname: `${basePath}/${product.id}`, search: location.search }}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
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