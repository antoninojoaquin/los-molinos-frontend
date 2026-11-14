import { useState } from "react";
import { FaFileImport } from "react-icons/fa";
import { getImages } from "../utils/image";
import { replaceAllProducts } from "./api";
import ConfirmDialog from "./ConfirmDialog";

// Solo en desarrollo (npm run dev): reemplaza todo el catálogo por los productos de un archivo JSON.
// Usa la sesión del admin, así que pasa por las mismas reglas y validaciones que el resto del panel.
// Formato: [{ name, category, price, description, inStock, images: [url, ...] }, ...]
export default function DevImport({ currentCount, onDone }) {
  const [products, setProducts] = useState(null);
  const [status, setStatus] = useState("");

  async function readFile(file) {
    setStatus("");
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || data.some((p) => !p.name || !p.category || !getImages(p).length || p.price == null)) {
        throw new Error("Cada producto necesita name, category, price e images");
      }
      setProducts(data);
    } catch (err) {
      setStatus(`Archivo inválido: ${err.message}`);
    }
  }

  async function confirm() {
    const list = products;
    setProducts(null);
    setStatus("Importando…");
    try {
      const deleted = await replaceAllProducts(list);
      setStatus(`Listo: se borraron ${deleted} productos y se crearon ${list.length}.`);
      onDone();
    } catch (err) {
      setStatus(`No se pudo importar: ${err.message}`);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-600 p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
      <p className="flex-1 text-gray-400">
        <b className="text-gray-200">Solo en desarrollo:</b> reemplazar todo el catálogo por un archivo JSON.
        {status && <span className="block mt-1 text-orange-300">{status}</span>}
      </p>
      <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white cursor-pointer">
        <FaFileImport />
        Importar productos
        <input
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            readFile(event.target.files[0]);
            event.target.value = "";
          }}
        />
      </label>

      <ConfirmDialog
        open={!!products}
        title="Reemplazar el catálogo"
        confirmLabel="Reemplazar"
        onCancel={() => setProducts(null)}
        onConfirm={confirm}
      >
        Se van a <b>borrar los {currentCount} productos actuales</b> y crear {products?.length} nuevos. La tienda no
        cambia hasta que publiques.
      </ConfirmDialog>
    </div>
  );
}
