import { lazy, Suspense, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// El mismo visor de la tienda: zoom con rueda, doble clic o pellizco, y arrastrar
const ImageViewer = lazy(() => import("../components/ImageViewer"));

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 text-white hover:text-orange-400 cursor-pointer";

// Foto a pantalla completa desde el formulario del panel, con flechas para pasar entre las fotos del producto.
// photos: [{ src, alt }]. Teclado: Escape cierra, flechas cambian de foto.
export default function PhotoViewer({ photos, index, onChange, onClose }) {
  const count = photos.length;
  const go = (step) => onChange((index + step + count) % count);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (count > 1 && event.key === "ArrowRight") onChange((index + 1) % count);
      if (count > 1 && event.key === "ArrowLeft") onChange((index - 1 + count) % count);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, count, onChange, onClose]);

  // Sin scroll de fondo mientras está abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const photo = photos[index];

  return createPortal(
    <Suspense fallback={<div className="fixed inset-0 z-[70] bg-black" />}>
      {/* key: al cambiar de foto el zoom arranca de cero */}
      <ImageViewer key={photo.src} src={photo.src} alt={photo.alt} onClose={onClose} />
      {count > 1 && (
        <div className="fixed inset-0 z-[71] pointer-events-none">
          <button onClick={() => go(-1)} aria-label="Foto anterior" className={`${arrowClass} left-3 pointer-events-auto`}>
            <FaChevronLeft />
          </button>
          <button onClick={() => go(1)} aria-label="Foto siguiente" className={`${arrowClass} right-3 pointer-events-auto`}>
            <FaChevronRight />
          </button>
          <p className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {index + 1} / {count}
          </p>
        </div>
      )}
    </Suspense>,
    document.body
  );
}
