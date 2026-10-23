import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaHome, FaThLarge, FaMapMarkerAlt, FaChevronRight, FaWhatsapp } from "react-icons/fa";
import Logo from "../assets/logo.png";
import { useCart } from "../context/cartContext";
import { BUSINESS_HOURS, formatRange, isOpenNow } from "../utils/business";
import { getWhatsAppUrl } from "../utils/whatsapp";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: FaHome },
  { to: "/productos", label: "Productos", icon: FaThLarge },
  { to: "/ubicacion", label: "Ubicación", icon: FaMapMarkerAlt },
];

function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const { totalItems, justAdded } = useCart();
  const { pathname } = useLocation();

  // Se cierra al navegar (incluye el botón "atrás")
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Con el menú abierto: sin scroll de fondo y Escape para cerrar
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openNow = open && isOpenNow();

  return (
    <header className="bg-gray-800 fixed w-full top-0 z-50 ">
      <div className="relative z-10 bg-gray-800 max-w-[1920px] mx-auto px-4 md:px-8 h-24 flex justify-between items-center">
        <div className="flex-shrink-0 cursor-pointer">
          <Link to="/">
            <img
              src={Logo}
              onClick={closeMenu}
              alt="Los Molinos Regionales"
              className="h-24 md:h-32 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center space-x-8 xl:space-x-16 text-xl font-medium tracking-widest text-orange-500">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative py-2 group"
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? "font-extrabold" : "hover:text-orange-400 transition-colors"}`}>
                    {item.label}
                  </span>
                  <span
                    className={`
                      absolute left-0 bottom-0 h-[2px] bg-orange-500 transition-all duration-300
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                    `}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-6 md:space-x-8">
          <div className="flex items-center space-x-6 text-2xl md:text-3xl">
            <Link to="/favoritos" onClick={closeMenu} aria-label="Favoritos" className="relative group">
              <FaHeart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
            </Link>
            <Link
              to="/carrito"
              onClick={closeMenu}
              aria-label={`Carrito (${totalItems} productos)`}
              className={`relative group block transition-transform duration-300 ${justAdded ? "scale-125" : ""}`}
            >
              <FaShoppingCart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-white text-gray-900 text-xs font-bold leading-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Las tres barras se transforman en una X */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="lg:hidden relative w-8 h-8 cursor-pointer"
          >
            {[
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1.5",
              open ? "top-1/2 -translate-y-1/2 opacity-0 scale-x-0" : "top-1/2 -translate-y-1/2",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[23px]",
            ].map((state, index) => (
              <span
                key={index}
                className={`absolute left-0 w-8 h-[3px] rounded-full bg-orange-500 transition-all duration-300 ${state}`}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Fondo oscuro: tocarlo cierra el menú */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 top-24 bg-black/70 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <nav
        id="mobile-menu"
        aria-label="Menú principal"
        inert={!open}
        className={`lg:hidden absolute inset-x-0 top-24 bg-gray-800 rounded-b-3xl shadow-2xl shadow-black/50 px-4 pt-2 pb-5 transition-all duration-300 ease-out
          ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.to}
              style={{ transitionDelay: open ? `${80 + index * 50}ms` : "0ms" }}
              className={`transition-all duration-300 ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
            >
              <NavLink
                to={item.to}
                end={item.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-4 rounded-2xl text-lg transition-colors
                  ${isActive ? "bg-orange-500/15 text-orange-400" : "text-gray-100 hover:text-white hover:bg-white/5"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-xl text-lg
                        ${isActive ? "bg-orange-500 text-white" : "bg-gray-700 text-orange-400"}
                      `}
                    >
                      <item.icon />
                    </span>
                    <span className={`flex-1 ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
                    <FaChevronRight className={`text-sm ${isActive ? "text-orange-400" : "text-gray-500"}`} />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div
          style={{ transitionDelay: open ? "230ms" : "0ms" }}
          className={`mt-4 pt-4 border-t border-gray-700 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className={`w-2 h-2 rounded-full ${openNow ? "bg-green-400" : "bg-gray-500"}`} />
            <span className={`text-sm font-semibold ${openNow ? "text-green-400" : "text-gray-400"}`}>
              {openNow ? "Abierto ahora" : "Cerrado ahora"}
            </span>
          </div>
          {BUSINESS_HOURS.map(({ days, ranges }) => (
            <p key={days} className="px-1 text-sm text-gray-400">
              {days}: {ranges.map(formatRange).join(" y ")} hs
            </p>
          ))}

          <a
            href={getWhatsAppUrl("¡Hola! Quería hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#25D366] text-white hover:text-white font-semibold"
          >
            <FaWhatsapp className="text-xl" />
            Escribinos por WhatsApp
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Header;
