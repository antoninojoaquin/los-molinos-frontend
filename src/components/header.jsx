import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import Logo from "../assets/logo.png";

function Header() {
  const [open, setOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const updateFavorites = () => {
      const storedFavorites =
        JSON.parse(localStorage.getItem("favorites")) || [];
      setFavoritesCount(storedFavorites.length);
    };

    updateFavorites();

    window.addEventListener("storage", updateFavorites);
    return () => window.removeEventListener("storage", updateFavorites);
  }, []);

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="flex justify-between items-center h-28 px-4 md:px-8">
        <div className="cursor-pointer flex-shrink-0">
          <Link to="/">
            <img src={Logo} onClick={closeMenu} alt="Los Molinos Regionales" className="h-32 md:h-44" />
          </Link>
        </div>

        <div className="flex items-center space-x-8">
          <div className="relative hidden lg:flex">
            <button className="border-none bg-transparent px-3 p-2.5 cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors duration-200 focus:outline-none">
              <FaSearch size={22} />
            </button>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-72 pl-10 pr-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-4xl">
            <Link to="/favoritos" className="relative">
              <FaHeart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <FaShoppingCart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
          </div>

          <div className="lg:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="border-none bg-transparent p-[0.6em] text-[2em] font-medium cursor-pointer text-orange-500 text-4xl focus:outline-none">
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-gray-100 border-1 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-40 text-xl tracking-widest text-orange-500 h-14 items-center">
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
                className="relative pb-1 transition-colors group inline-block"
              >
                {({ isActive }) => (
                  <>
                    <span className={`${isActive ? "text-orange-500" : "hover:text-orange-400"}`}>
                      {item.label}
                    </span>

                    <span
                      className={`
                        absolute left-0 -bottom-1 h-[2px] bg-orange-500 transition-all duration-300
                        ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                      `}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {open && (
        <nav className="animate-slideDown px-4 py-4 space-y-4">
          <div className="relative">
            <button className="border-none bg-transparent px-3 p-2.5 cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors duration-200 focus:outline-none">
              <FaSearch size={20} />
            </button>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex space-x-8 text-3xl text-orange-500">
            <Link to="/favoritos" onClick={closeMenu} className="relative">
              <FaHeart className="cursor-pointer hover:text-orange-400 transition-colors duration-200" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <FaShoppingCart className="cursor-pointer hover:text-orange-400 transition-colors duration-200" />
          </div>
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