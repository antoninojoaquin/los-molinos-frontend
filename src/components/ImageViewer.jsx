import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FaTimes } from "react-icons/fa";

// Visor a pantalla completa para celular: pellizcar para zoom, doble toque y arrastrar
export default function ImageViewer({ src, alt, onClose }) {
  const closeButtonRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${alt}`}
      className="fixed inset-0 z-[70] bg-black animate-fadeIn"
    >
      <TransformWrapper
        minScale={1}
        maxScale={4}
        centerOnInit
        limitToBounds
        doubleClick={{ mode: "toggle", step: 1.5 }}
        panning={{ velocityDisabled: false }}
        onTransformed={(_, state) => setZoomed(state.scale > 1.01)}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100dvh" }}
          contentStyle={{ width: "100%", height: "100dvh" }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="h-full w-full object-contain select-none"
          />
        </TransformComponent>
      </TransformWrapper>

      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Cerrar imagen"
        className="absolute right-3 z-10 p-3 rounded-full bg-black/60 text-white cursor-pointer"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <FaTimes className="text-lg" />
      </button>

      <p
        hidden={zoomed}
        className="pointer-events-none absolute inset-x-0 text-center text-xs text-white/60"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        Pellizcá o tocá dos veces para hacer zoom
      </p>
    </div>
  );
}
