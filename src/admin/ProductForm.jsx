import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheck, FaUpload } from "react-icons/fa";
import { optimizeImage } from "../utils/image";
import { isInStock } from "../utils/stock";
import { MAX_IMAGE_BYTES, saveProduct, uploadImage } from "./api";

// Límites iguales a los de firestore.rules
const MAX_NAME = 120;
const MAX_CATEGORY = 60;
const MAX_DESCRIPTION = 1000;

const fieldClass =
  "w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500";

export default function ProductForm({ product, categories, onDone }) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [inStock, setInStock] = useState(product ? isInStock(product) : true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(product ? optimizeImage(product.imageUrl, 400) : "");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false); // false | "upload" | "save"

  // Libera la URL temporal de la vista previa al cambiar de archivo o salir
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  function pickFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) return setError("El archivo tiene que ser una imagen.");
    if (selected.size > MAX_IMAGE_BYTES) return setError("La imagen pesa más de 5 MB.");
    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!price) return setError("Ingresá el precio.");
    if (!product && !file) return setError("Subí una foto del producto.");

    setError("");
    try {
      setBusy(file ? "upload" : "save");
      const imageUrl = file ? await uploadImage(file) : product.imageUrl;
      setBusy("save");
      await saveProduct({ id: product?.id, name, category, description, price: Number(price), inStock, imageUrl });
      onDone(true);
    } catch (err) {
      setError(err.message || "No se pudo guardar el producto.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => onDone(false)}
          disabled={!!busy}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-400 cursor-pointer mb-2"
        >
          <FaArrowLeft />
          Volver a productos
        </button>
        <h1 className="text-white text-3xl">{product ? "Editar producto" : "Nuevo producto"}</h1>
      </div>

      <div className="grid md:grid-cols-[18rem_1fr] gap-6">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files[0]);
          }}
          className={`relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer flex items-center justify-center bg-gray-800 ${
            dragging ? "border-orange-500" : "border-gray-600 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => pickFile(event.target.files?.[0])}
          />
          {preview ? (
            <>
              <img src={preview} alt="Vista previa" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full whitespace-nowrap">
                <FaUpload />
                Cambiar foto
              </span>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 text-gray-400 text-center px-4">
              <FaUpload className="text-2xl text-orange-500" />
              <b className="text-gray-200">Arrastrá una foto o hacé clic</b>
              <small>JPG, PNG o WEBP · hasta 5 MB</small>
            </span>
          )}
        </label>

        <div className="bg-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Nombre</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_NAME}
              required
              placeholder="Ej: Set Asador con Estuche de Cuero"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Categoría</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              list="categories"
              maxLength={MAX_CATEGORY}
              required
              placeholder="Elegí una existente o escribí una nueva"
              className={fieldClass}
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Precio</span>
            <span className="flex items-center gap-2">
              <span className="text-gray-400">$</span>
              {/* Texto y no number: sin flechitas, y con puntos de miles (13.500) */}
              <input
                inputMode="numeric"
                autoComplete="off"
                value={price ? Number(price).toLocaleString("es-AR") : ""}
                onChange={(event) => setPrice(event.target.value.replace(/\D/g, "").slice(0, 9))}
                required
                placeholder="0"
                className={fieldClass}
              />
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="flex justify-between text-sm text-gray-300">
              Descripción
              <small className="text-gray-500">
                {description.length}/{MAX_DESCRIPTION}
              </small>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={MAX_DESCRIPTION}
              rows={4}
              placeholder="Qué es, materiales, medidas…"
              className={fieldClass}
            />
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
            <span>
              <b className="text-white font-medium">Hay stock</b>
              <small className="block text-gray-400">
                Si lo destildás, se muestra como "Sin stock" y no se puede agregar al carrito.
              </small>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && (
          <p className="text-red-400 mr-auto" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => onDone(false)}
          disabled={!!busy}
          className="px-5 py-2.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
        >
          Cancelar
        </button>
        <button
          disabled={!!busy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 text-white font-semibold cursor-pointer disabled:cursor-wait"
        >
          <FaCheck />
          {busy === "upload" ? "Subiendo foto…" : busy === "save" ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
