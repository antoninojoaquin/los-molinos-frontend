import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import Logo from "../assets/logo.png";
import Lottie from "lottie-react";
import cartAnimation from "../assets/success.json";

function Header({ showSuccess }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const updateFavorites = () => {
      const storedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
    };

    updateFavorites();

    window.addEventListener("storage", updateFavorites);
    return () => window.removeEventListener("storage", updateFavorites);
  }, []);

  return (
    <header className="bg-white fixed w-full top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 h-24 flex justify-between items-center">
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
          {[
            { to: "/", label: "Inicio" },
            { to: "/productos", label: "Productos" },
            { to: "/ubicacion", label: "Ubicación" },
            { to: "/nosotros", label: "Nosotros" },
            { to: "/contacto", label: "Contacto" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative py-2 group"
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? "text-orange-600 font-bold" : "hover:text-orange-400 transition-colors"}`}>
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
            <Link to="/favoritos" className="relative group">
              <FaHeart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
            </Link>
            <Link to="/carrito" className="relative group flex items-center justify-center w-9 h-9">
              {showSuccess ? (
                <Lottie animationData={cartAnimation} style={{ width: 60, height: 60 }} />
              ) : (
                <FaShoppingCart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
              )}
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setOpen(!open)} 
              className="border-none bg-transparent text-orange-500 text-3xl cursor-pointer focus:outline-none"
            >
              ☰
            </button>
          </div>
        </div>

      </div>

      {open && (
        <nav className="animate-slideDown px-4 py-4 space-y-4">
          <Link to="/" onClick={closeMenu} className="block text-lg hover:text-orange-400 transition-colors duration-200">Inicio</Link>
          <Link to="/productos" onClick={closeMenu} className="block text-lg hover:text-orange-400 transition-colors duration-200">Productos</Link>
          <Link to="/ubicacion" onClick={closeMenu} className="block text-lg hover:text-orange-400 transition-colors duration-200">Ubicación</Link>
          <Link to="/nosotros" onClick={closeMenu} className="block text-lg hover:text-orange-400 transition-colors duration-200">Nosotros</Link>
          <Link to="/contacto" onClick={closeMenu} className="block text-lg hover:text-orange-400 transition-colors duration-200">Contacto</Link>
        </nav>
      )}
    </header>
  );
}

export default Header;