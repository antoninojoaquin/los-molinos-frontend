import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "../utils/whatsapp";

// Rutas donde ya hay un botón de WhatsApp propio: el carrito y el detalle de producto
const HIDDEN_ON = /^\/(carrito|productos\/[^/]+|favoritos\/[^/]+)\/?$/;

export default function WhatsAppButton() {
  const { pathname } = useLocation();

  if (HIDDEN_ON.test(pathname)) return null;

  return (
    <a
      href={getWhatsAppUrl("¡Hola! Quería hacer una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed right-4 md:right-6 z-40 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-110 animate-fadeIn"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <FaWhatsapp className="text-white text-3xl md:text-4xl" />
    </a>
  );
}
