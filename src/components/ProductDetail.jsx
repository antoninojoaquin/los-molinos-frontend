import { useEffect, useRef, useState } from "react";
import { FaTimes, FaWhatsapp, FaSearchPlus } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";
import { useCart } from "../context/cartContext";
import { formatPrice } from "../utils/formatPrice";
import { getStock } from "../utils/stock";
import { getWhatsAppUrl } from "../utils/whatsapp";

const ZOOM_SCALE = 2.5;

function ZoomableImage({ src, alt, grayscale }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  // El punto de zoom sigue al mouse o al dedo
  const updateOrigin = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={zoomed ? "Alejar imagen" : "Acercar imagen"}
      onClick={(event) => {
        updateOrigin(event);
        setZoomed((prev) => !prev);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOrigin("50% 50%");
          setZoomed((prev) => !prev);
        }
      }}
      onPointerMove={(event) => zoomed && updateOrigin(event)}
      className={`relative h-full w-full overflow-hidden select-none
        ${zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"}
      `}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ transformOrigin: origin, transform: zoomed ? `scale(${ZOOM_SCALE})` : undefined }}
        className={`h-full w-full object-cover transition-transform duration-300 ${grayscale ? "grayscale" : ""}`}
      />

      {!zoomed && (
        <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs text-white">
          <FaSearchPlus />
          <span className="md:hidden">Tocá para hacer zoom</span>
          <span className="hidden md:inline">Hacé clic para hacer zoom</span>
        </span>
      )}
    </div>
  );
}

export default function ProductDetail({ product, onClose }) {
  const { getQuantity } = useCart();
  const closeButtonRef = useRef(null);

  const stock = getStock(product);
  const outOfStock = stock <= 0;
  const inCart = getQuantity(product.id);

  // Bloquea el scroll de fondo, cierra con Escape y devuelve el foco al cerrar
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${product.name} | Los Molinos Regionales`;
    return () => {
      document.title = previousTitle;
    };
  }, [product.name]);

  const productUrl = `${window.location.origin}/productos/${product.id}`;
  const whatsAppUrl = getWhatsAppUrl(
    `¡Hola! quería consultar por "${product.name}" (${formatPrice(product.price)}).\n${productUrl}`
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full md:max-w-4xl max-h-[92dvh] md:max-h-[85vh] overflow-y-auto md:overflow-hidden bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-2xl md:grid md:grid-cols-2 animate-slideUp"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:text-orange-300 transition-colors cursor-pointer"
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="aspect-[4/3] md:aspect-auto md:h-full md:max-h-[85vh] bg-gray-800">
          <ZoomableImage src={product.imageUrl} alt={product.name} grayscale={outOfStock} />
        </div>

        <div className="flex flex-col gap-3 p-5 md:p-8 md:overflow-y-auto md:max-h-[85vh]">
          <p className="text-orange-300 uppercase tracking-wide text-xs">
            {product.category}
          </p>

          <h2 id="product-detail-title" className="text-white text-2xl md:text-3xl leading-tight">
            {product.name}
          </h2>

          <p className="text-white font-extrabold text-3xl">
            {formatPrice(product.price)}
          </p>

          {Number.isFinite(stock) && (
            <p className={`text-sm ${outOfStock ? "text-gray-400" : stock <= 2 ? "text-orange-400" : "text-gray-400"}`}>
              {outOfStock
                ? "Sin stock por el momento"
                : `Stock disponible: ${stock}${inCart > 0 ? ` · ${inCart} en tu carrito` : ""}`}
            </p>
          )}

          {product.description && (
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-3">
            <AddToCartButton product={product} className="py-3 text-sm md:text-base" />

            <button
              onClick={() => window.open(whatsAppUrl, "_blank", "noopener,noreferrer")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-green-500 text-green-400 hover:bg-green-500 hover:text-white font-semibold text-sm md:text-base transition-colors cursor-pointer"
            >
              <FaWhatsapp className="text-xl" />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
