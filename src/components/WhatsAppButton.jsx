import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "../utils/whatsapp";

// Rutas donde ya hay un botón de WhatsApp propio: el carrito y el detalle de producto
const HIDDEN_ON = /^\/(carrito|productos\/[^/]+|favoritos\/[^/]+)\/?$/;

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  const [footerVisible, setFooterVisible] = useState(false);

  // El footer ya tiene su ícono de WhatsApp: cuando ese ícono está en pantalla, el flotante se oculta
  useEffect(() => {
    const footerIcon = document.querySelector('footer a[href*="wa.me"]');
    if (!footerIcon) return;

    const observer = new IntersectionObserver(([entry]) =>
      setFooterVisible(entry.isIntersecting)
    );
    observer.observe(footerIcon);
    return () => observer.disconnect();
  }, []);

  if (HIDDEN_ON.test(pathname)) return null;

  return (
    <a
      href={getWhatsAppUrl("¡Hola! Quería hacer una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      aria-hidden={footerVisible}
      tabIndex={footerVisible ? -1 : 0}
      className={`fixed right-4 md:right-6 z-40 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] shadow-lg shadow-black/40 transition-all duration-300 hover:scale-110
        ${footerVisible ? "opacity-0 scale-75 pointer-events-none" : "opacity-100"}
      `}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <FaWhatsapp className="text-white text-3xl md:text-4xl" />
    </a>
  );
}
