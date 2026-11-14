import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaCheck, FaSearchPlus, FaStar, FaTimes, FaUpload } from "react-icons/fa";
import { getImages, optimizeImage } from "../utils/image";
import { isInStock } from "../utils/stock";
import { MAX_IMAGE_BYTES, MAX_IMAGES, saveProduct, uploadImage } from "./api";
import PhotoViewer from "./PhotoViewer";

// Límites iguales a los de firestore.rules
const MAX_NAME = 120;
const MAX_CATEGORY = 60;
const MAX_DESCRIPTION = 1000;

const fieldClass =
  "w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500";

let nextKey = 0;

// Cada foto es { key, url } si ya está en Cloudinary, o { key, file, preview } si es nueva (se sube al guardar)
const fromUrl = (url) => ({ key: url, url, preview: optimizeImage(url, 400) });

function PhotoTile({ photo, index, onOpen, onRemove, onMakeMain, disabled }) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 group">
      {/* Tocar la foto la abre en grande para revisarla de cerca */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver la foto ${index + 1} en grande`}
        className="block w-full h-full cursor-zoom-in"
      >
        <img src={photo.preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
        <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <FaSearchPlus className="text-xs" />
        </span>
      </button>
      {index === 0 && (
        <span className="absolute top-2 left-2 text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
          Principal
        </span>
      )}
      <div className="absolute top-2 right-2 flex gap-1">
        {index > 0 && (
          <button
            type="button"
            onClick={onMakeMain}
            disabled={disabled}
            title="Usar como foto principal"
            aria-label={`Usar la foto ${index + 1} como principal`}
            className="p-1.5 rounded-full bg-black/70 text-white hover:text-orange-400 cursor-pointer"
          >
            <FaStar className="text-xs" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          title="Quitar foto"
          aria-label={`Quitar la foto ${index + 1}`}
          className="p-1.5 rounded-full bg-black/70 text-white hover:text-red-400 cursor-pointer"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default function ProductForm({ product, categories, onDone }) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [inStock, setInStock] = useState(product ? isInStock(product) : true);
  const [photos, setPhotos] = useState(() => (product ? getImages(product).map(fromUrl) : []));
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(""); // texto del paso en curso al guardar, o vacío
  const [viewing, setViewing] = useState(null); // índice de la foto abierta en grande, o null

  // Libera las vistas previas temporales de fotos nuevas al salir
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(
    () => () => photosRef.current.forEach((p) => p.file && URL.revokeObjectURL(p.preview)),
    []
  );

  function addFiles(fileList) {
    const files = [...(fileList ?? [])];
    if (!files.length) return;
    if (files.some((f) => !f.type.startsWith("image/"))) return setError("Los archivos tienen que ser imágenes.");
    if (files.some((f) => f.size > MAX_IMAGE_BYTES)) return setError("Cada foto puede pesar hasta 5 MB.");
    if (photos.length + files.length > MAX_IMAGES) return setError(`Podés cargar hasta ${MAX_IMAGES} fotos.`);
    setError("");
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ key: `new-${nextKey++}`, file, preview: URL.createObjectURL(file) })),
    ]);
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed.file) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const makeMain = (index) =>
    setPhotos((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!price) return setError("Ingresá el precio.");
    if (!photos.length) return setError("Subí al menos una foto del producto.");

    setError("");
    try {
      // Sube las fotos nuevas en orden; las que ya estaban en Cloudinary se mantienen
      const pending = photos.filter((p) => !p.url).length;
      let uploaded = 0;
      const images = [];
      for (const photo of photos) {
        if (photo.url) {
          images.push(photo.url);
          continue;
        }
        uploaded++;
        setBusy(pending > 1 ? `Subiendo foto ${uploaded} de ${pending}…` : "Subiendo foto…");
        images.push(await uploadImage(photo.file));
      }
      setBusy("Guardando…");
      await saveProduct({ id: product?.id, name, category, description, price: Number(price), inStock, images });
      onDone(true);
    } catch (err) {
      setError(err.message || "No se pudo guardar el producto.");
      setBusy("");
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

      <div className="grid md:grid-cols-[20rem_1fr] gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-300">
            Fotos <span className="text-gray-500">({photos.length}/{MAX_IMAGES})</span>
          </p>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <PhotoTile
                key={photo.key}
                photo={photo}
                index={index}
                disabled={!!busy}
                onOpen={() => setViewing(index)}
                onRemove={() => removePhoto(index)}
                onMakeMain={() => makeMain(index)}
              />
            ))}
            {photos.length < MAX_IMAGES && (
              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
                className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-1 text-center px-2 text-gray-400 bg-gray-800 ${
                  dragging ? "border-orange-500" : "border-gray-600 hover:border-gray-400"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                <FaUpload className="text-xl text-orange-500" />
                <span className="text-xs">Agregar fotos</span>
              </label>
            )}
          </div>
          <small className="text-gray-500">
            JPG, PNG o WEBP, hasta 5 MB cada una. La principal es la que se ve en el catálogo; con la estrella elegís otra.
          </small>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 flex flex-col gap-4 self-start">
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
          {busy || "Guardar"}
        </button>
      </div>
      {viewing != null && photos[viewing] && (
        <PhotoViewer
          // Las fotos nuevas se ven desde el archivo local; las ya subidas, en calidad completa desde Cloudinary
          photos={photos.map((photo, index) => ({
            src: photo.file ? photo.preview : optimizeImage(photo.url),
            alt: `${name || "Producto"} - foto ${index + 1}`,
          }))}
          index={viewing}
          onChange={setViewing}
          onClose={() => setViewing(null)}
        />
      )}
    </form>
  );
}
