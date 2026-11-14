import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FaEdit, FaPlus, FaRegStar, FaSearch, FaStar, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { normalize } from "../utils/catalogFilters";
import { formatPrice } from "../utils/formatPrice";
import { mainImage, optimizeImage } from "../utils/image";
import { isInStock } from "../utils/stock";
import { deleteProduct, fetchAllProducts, fetchPublishState, publish, saveProduct } from "./api";
import ConfirmDialog from "./ConfirmDialog";
import ProductForm from "./ProductForm";

// La importación masiva existe solo en npm run dev: en el build de producción este import desaparece
const DevImport = import.meta.env.DEV ? lazy(() => import("./DevImport")) : null;

const formatTime = (date) =>
  date.toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUSES = [
  { key: "all", label: "Todos" },
  { key: "visible", label: "Visibles" },
  { key: "hidden", label: "Ocultos" },
  { key: "out", label: "Sin stock" },
  { key: "featured", label: "Destacados" },
];

const matchesStatus = (product, status) =>
  status === "visible"
    ? product.visible !== false
    : status === "hidden"
      ? product.visible === false
      : status === "out"
        ? !isInStock(product)
        : status === "featured"
          ? product.featured === true
          : true;

// Buscador del panel: por nombre, categoría y estado (visible, oculto o sin stock)
function ListFilters({ query, onQuery, category, onCategory, categories, status, onStatus, products }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1 flex items-center">
          <span className="sr-only">Buscar productos</span>
          <FaSearch className="pointer-events-none absolute left-4 text-stone-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar por nombre o descripción"
            className="w-full h-11 rounded-full bg-stone-900 border border-stone-700 pl-11 pr-10 text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              aria-label="Borrar búsqueda"
              className="absolute right-3 p-1.5 text-stone-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </label>
        <label className="sm:w-64">
          <span className="sr-only">Categoría</span>
          <select
            value={category}
            onChange={(event) => onCategory(event.target.value)}
            className="w-full h-11 rounded-full bg-stone-900 border border-stone-700 px-4 text-white focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
        {STATUSES.map(({ key, label }) => {
          const count = products.filter((p) => matchesStatus(p, key)).length;
          const selected = status === key;
          return (
            <button
              key={key}
              onClick={() => onStatus(key)}
              aria-pressed={selected}
              className={`px-3.5 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                selected ? "bg-orange-500 text-white" : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              {label} <span className={selected ? "text-white/80" : "text-stone-500"}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PublishBar({ state, publishing, justPublished, onPublish }) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
        state.pending ? "bg-orange-500/15 border border-orange-500/40" : "bg-stone-800"
      }`}
    >
      <div className="flex-1 text-sm">
        {justPublished ? (
          <p className="text-green-400">
            Publicando. La tienda se actualiza en 1 o 2 minutos.
          </p>
        ) : state.pending ? (
          <p className="text-orange-200">
            Hay cambios sin publicar: la tienda todavía muestra la versión anterior.
          </p>
        ) : (
          <p className="text-stone-400">
            La tienda está al día
            {state.publishedAt && ` · última publicación: ${formatTime(state.publishedAt)}`}
          </p>
        )}
      </div>
      <button
        onClick={onPublish}
        disabled={!state.pending || publishing}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold cursor-pointer disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-not-allowed"
      >
        <FaUpload />
        {publishing ? "Publicando…" : "Publicar cambios"}
      </button>
    </div>
  );
}

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [publishState, setPublishState] = useState({ pending: false, publishedAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // producto, "new" o null
  const [pendingId, setPendingId] = useState(null); // producto que se está guardando
  const [removing, setRemoving] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  // Al volver de editar, la lista vuelve a la misma altura (no al principio)
  const scrollBeforeEdit = useRef(0);

  const openEditor = (target) => {
    scrollBeforeEdit.current = window.scrollY;
    setEditing(target);
  };

  useEffect(() => {
    if (!editing) requestAnimationFrame(() => window.scrollTo(0, scrollBeforeEdit.current));
  }, [editing]);

  const refresh = useCallback(async () => {
    const [all, state] = await Promise.all([fetchAllProducts(), fetchPublishState()]);
    setProducts(all);
    setPublishState(state);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setError("No se pudieron cargar los productos."))
      .finally(() => setLoading(false));
  }, [refresh]);

  // Corre un cambio y recarga la lista; si falla, avisa sin perder lo que hay en pantalla
  async function run(id, action) {
    if (pendingId) return;
    setPendingId(id);
    try {
      await action();
      await refresh();
      setJustPublished(false);
      setError("");
    } catch {
      setError("No se pudo guardar el cambio. Revisá tu conexión y probá de nuevo.");
    } finally {
      setPendingId(null);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError("");
    try {
      await publish();
      setPublishState(await fetchPublishState());
      setJustPublished(true);
    } catch (err) {
      setError(`No se pudo publicar: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  }

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={[...new Set(products.map((p) => p.category))]}
        onDone={(saved) => {
          setEditing(null);
          if (saved) {
            setJustPublished(false);
            refresh().catch(() => setError("No se pudo recargar la lista."));
          }
        }}
      />
    );
  }

  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) => a.localeCompare(b));
  const words = normalize(query).split(/s+/).filter(Boolean);
  const filtered = products.filter(
    (p) =>
      (!category || p.category === category) &&
      matchesStatus(p, status) &&
      words.every((word) => normalize(`${p.name} ${p.category} ${p.description ?? ""}`).includes(word))
  );
  const filtering = !!(words.length || category || status !== "all");
  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setStatus("all");
  };

  const outCount = products.filter((p) => !isInStock(p)).length;
  const hiddenCount = products.filter((p) => p.visible === false).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl">Productos</h1>
          {!loading && (
            <p className="text-stone-400 text-sm mt-1">
              {products.length} productos
              {hiddenCount > 0 && ` · ${hiddenCount} ocultos`}
              {outCount > 0 && ` · ${outCount} sin stock`}
            </p>
          )}
        </div>
        <button
          onClick={() => openEditor("new")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold cursor-pointer"
        >
          <FaPlus />
          Nuevo producto
        </button>
      </div>

      {!loading && (
        <PublishBar
          state={publishState}
          publishing={publishing}
          justPublished={justPublished}
          onPublish={handlePublish}
        />
      )}

      {DevImport && !loading && (
        <Suspense fallback={null}>
          <DevImport
            currentCount={products.length}
            onDone={() => refresh().catch(() => setError("No se pudo recargar la lista."))}
          />
        </Suspense>
      )}

      {error && <p className="text-red-400" role="alert">{error}</p>}

      {!loading && products.length > 0 && (
        <ListFilters
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          categories={categories}
          status={status}
          onStatus={setStatus}
          products={products}
        />
      )}

      {loading ? (
        <p className="text-stone-400">Cargando productos…</p>
      ) : products.length === 0 ? (
        <p className="text-stone-400">Todavía no hay productos. Creá el primero.</p>
      ) : filtered.length === 0 ? (
        <div className="text-stone-400 flex flex-wrap items-center gap-3">
          Ningún producto coincide con la búsqueda.
          <button onClick={clearFilters} className="text-orange-400 hover:text-orange-300 cursor-pointer">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
        {filtering && (
          <p className="text-stone-400 text-sm -mb-3 flex flex-wrap gap-3">
            Mostrando {filtered.length} de {products.length}
            <button onClick={clearFilters} className="text-orange-400 hover:text-orange-300 cursor-pointer">
              Limpiar filtros
            </button>
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {filtered.map((product) => {
            const inStock = isInStock(product);
            const visible = product.visible !== false;
            const busy = pendingId === product.id;
            return (
              <li
                key={product.id}
                className={`flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-3 rounded-2xl p-3 ${
                  visible ? "bg-stone-800" : "bg-stone-800/50 border border-dashed border-stone-700"
                } ${busy ? "opacity-60" : ""}`}
              >
                <img
                  src={optimizeImage(mainImage(product), 300)}
                  alt=""
                  className={`w-16 h-16 rounded-lg object-cover shrink-0 ${inStock ? "" : "grayscale"} ${visible ? "" : "opacity-50"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${visible ? "text-white" : "text-stone-400"}`}>{product.name}</p>
                  <p className="text-stone-400 text-sm truncate">
                    {product.category} · {formatPrice(product.price)}
                  </p>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                  <button
                    onClick={() => run(product.id, () => saveProduct({ ...product, visible: !visible }))}
                    disabled={!!pendingId}
                    title={visible ? "Ocultar de la tienda" : "Mostrar en la tienda"}
                    aria-label={`${product.name}: ${visible ? "visible. Ocultar de la tienda" : "oculto. Mostrar en la tienda"}`}
                    className={`w-24 py-1.5 rounded-full text-sm font-semibold cursor-pointer disabled:cursor-wait ${
                      visible
                        ? "bg-sky-600/20 text-sky-300 hover:bg-sky-600/30"
                        : "bg-stone-700 text-stone-400 hover:bg-stone-600"
                    }`}
                  >
                    {visible ? "Visible" : "Oculto"}
                  </button>
                  <button
                    onClick={() => run(product.id, () => saveProduct({ ...product, inStock: !inStock }))}
                    disabled={!!pendingId}
                    title={inStock ? "Marcar sin stock" : "Marcar con stock"}
                    aria-label={`${product.name}: ${inStock ? "con stock. Marcar sin stock" : "sin stock. Marcar con stock"}`}
                    className={`w-28 py-1.5 rounded-full text-sm font-semibold cursor-pointer disabled:cursor-wait ${
                      inStock
                        ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                        : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                  >
                    {inStock ? "Con stock" : "Sin stock"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => run(product.id, () => saveProduct({ ...product, featured: !product.featured }))}
                      disabled={!!pendingId}
                      aria-pressed={product.featured === true}
                      aria-label={product.featured ? `Quitar ${product.name} de destacados` : `Destacar ${product.name} en el inicio`}
                      title={product.featured ? "Quitar de destacados" : "Destacar en el inicio"}
                      className={`p-2.5 rounded-full hover:bg-stone-700 cursor-pointer ${
                        product.featured ? "text-yellow-400" : "text-stone-500 hover:text-yellow-400"
                      }`}
                    >
                      {product.featured ? <FaStar /> : <FaRegStar />}
                    </button>
                    <button
                      onClick={() => openEditor(product)}
                      disabled={!!pendingId}
                      aria-label={`Editar ${product.name}`}
                      title="Editar"
                      className="p-2.5 rounded-full text-stone-300 hover:text-orange-400 hover:bg-stone-700 cursor-pointer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setRemoving(product)}
                      disabled={!!pendingId}
                      aria-label={`Eliminar ${product.name}`}
                      title="Eliminar"
                      className="p-2.5 rounded-full text-stone-300 hover:text-red-400 hover:bg-stone-700 cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        </>
      )}

      <ConfirmDialog
        open={!!removing}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const { id } = removing;
          setRemoving(null);
          run(id, () => deleteProduct(id));
        }}
      >
        Vas a eliminar <b>{removing?.name}</b>. Esta acción no se puede deshacer.
      </ConfirmDialog>
    </div>
  );
}
