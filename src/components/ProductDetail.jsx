import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaWhatsapp, FaSearchPlus, FaShareAlt, FaCheck } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";
import { useCart } from "../context/cartContext";
import { formatPrice } from "../utils/formatPrice";
import { getStock } from "../utils/stock";
import { getWhatsAppUrl } from "../utils/whatsapp";
import { optimizeImage } from "../utils/image";

const ZOOM_SCALE = 2.5;

// Solo se descarga en celulares, al abrir la imagen
const ImageViewer = lazy(() => import("./ImageViewer"));

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

// El zoom se aplica directo sobre el DOM (sin re-render de React) y solo con transform,
// que lo resuelve la GPU sin repintar: así el paneo sigue fluido en celulares.
function ZoomableImage({ src, alt, grayscale }) {
  const [zoomed, setZoomed] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isTouch] = useState(isTouchDevice);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const rectRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Con transform-origin 0 0, trasladar -(escala - 1) * punto deja ese punto fijo bajo el cursor
  const applyTransform = (scale, x, y, duration) => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = `transform ${duration}ms ease-out`;
    img.style.transform =
      scale === 1
        ? "none"
        : `translate(${-(scale - 1) * x * 100}%, ${-(scale - 1) * y * 100}%) scale(${scale})`;
  };

  const getPoint = (clientX, clientY) => {
    const rect = rectRef.current ?? containerRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  };

  const toggleZoom = (point) => {
    const next = !zoomed;
    rectRef.current = containerRef.current.getBoundingClientRect();
    applyTransform(next ? ZOOM_SCALE : 1, point.x, point.y, 300);
    setZoomed(next);
  };

  const handlePointerMove = (event) => {
    if (!zoomed) return;
    const { x, y } = getPoint(event.clientX, event.clientY);
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => applyTransform(ZOOM_SCALE, x, y, 120));
  };

  return (
    <>
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        aria-label={isTouch ? "Ver imagen en pantalla completa" : zoomed ? "Alejar imagen" : "Acercar imagen"}
        onClick={(event) => {
          // En celular el zoom se hace en el visor a pantalla completa (pellizco, doble toque)
          if (isTouch) setViewerOpen(true);
          else toggleZoom(getPoint(event.clientX, event.clientY));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleZoom({ x: 0.5, y: 0.5 });
          }
        }}
        onPointerMove={handlePointerMove}
        className={`relative h-full w-full overflow-hidden select-none bg-black
          ${zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"}
        `}
      >
        <img
          ref={imgRef}
          src={optimizeImage(src)}
          alt={alt}
          draggable={false}
          decoding="async"
          className={`h-full w-full object-contain origin-top-left ${zoomed ? "will-change-transform" : ""} ${grayscale ? "grayscale" : ""}`}
        />

        {!zoomed && (
          <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            <FaSearchPlus />
            {isTouch ? "Tocá para ampliar" : "Hacé clic para hacer zoom"}
          </span>
        )}
      </div>

      {/* Fuera del contenedor (si no, el clic en cerrar burbujea y lo reabre) y montado en body */}
      {viewerOpen &&
        createPortal(
          <Suspense fallback={null}>
            <ImageViewer src={optimizeImage(src)} alt={alt} onClose={() => setViewerOpen(false)} />
          </Suspense>,
          document.body
        )}
    </>
  );
}

export default function ProductDetail({ product, onClose }) {
  const { getQuantity } = useCart();
  const closeButtonRef = useRef(null);

  const stock = getStock(product);
  const outOfStock = stock <= 0;
  const inCart = getQuantity(product.id);
  const [linkCopied, setLinkCopied] = useState(false);
  const copiedTimeout = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimeout.current), []);

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

  const productUrl = `${window.location.origin}/productos/${product.id}`;
  const whatsAppUrl = getWhatsAppUrl(
    `¡Hola! quería consultar por "${product.name}" (${formatPrice(product.price)}).\n${productUrl}`
  );

  // En celular abre el menú nativo de compartir. En PC copia el link: el menú de Windows
  // manda a WhatsApp Desktop, y la mayoría usa WhatsApp Web.
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatPrice(product.price)} en Los Molinos Regionales`,
      url: productUrl,
    };

    if (navigator.share && isTouchDevice()) {
      try {
        await navigator.share(shareData);
      } catch {
        // El usuario canceló el menú de compartir
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setLinkCopied(true);
      clearTimeout(copiedTimeout.current);
      copiedTimeout.current = setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("No se pudo copiar el link:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/85 md:p-6 animate-fadeIn"
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
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 text-white hover:text-orange-300 transition-colors cursor-pointer"
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="h-[50dvh] md:h-full md:max-h-[85vh] bg-black">
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

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {linkCopied ? <FaCheck className="text-green-400" /> : <FaShareAlt />}
              {linkCopied ? "¡Link copiado!" : "Compartir producto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
