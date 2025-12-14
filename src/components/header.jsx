import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import Logo from "../assets/logo.png";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="flex justify-between items-center h-28 px-4 md:px-8">
        <div className="cursor-pointer flex-shrink-0">
          <Link to="/">
            <img src={Logo} alt="Los Molinos Regionales" className="h-32 md:h-44" />
          </Link>
        </div>

        <div className="flex items-center space-x-8">
          <div className="relative hidden md:flex">
            <button className="border-none bg-transparent p-[0.6em] text-[2em] font-medium cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors duration-200 focus:outline-none">
              <FaSearch size={22} />
            </button>
            <input
              type="text"
              placeholder=" Buscar productos..."
              className="w-72 pl-10 pr-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="hidden md:flex items-center space-x-6 text-4xl">
            <FaHeart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
            <FaShoppingCart className="text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200" />
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="border-none bg-transparent p-[0.6em] text-[2em] font-medium cursor-pointer text-orange-500 text-4xl focus:outline-none">
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-inner hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-40 text-xl tracking-widest text-orange-500 h-14 items-center">
            <Link to="/" className="hover:text-orange-400 transition-colors duration-200">Inicio</Link>
            <Link to="/productos" className="hover:text-orange-400 transition-colors duration-200">Productos</Link>
            <Link to="/ubicacion" className="hover:text-orange-400 transition-colors duration-200">Ubicación</Link>
            <Link to="/nosotros" className="hover:text-orange-400 transition-colors duration-200">Nosotros</Link>
            <Link to="/contacto" className="hover:text-orange-400 transition-colors duration-200">Contacto</Link>
          </nav>
        </div>
      </div>

      {open && (
        <nav className="animate-slideDown px-4 py-4 space-y-4">
          <div className="relative">
            <button className="border-none bg-transparent p-[0.6em] text-[2em] font-medium cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors duration-200 focus:outline-none">
              <FaSearch size={20} />
            </button>
            <input
              type="text"
              placeholder=" Buscar productos..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex space-x-8 text-3xl text-orange-500">
            <FaHeart className="cursor-pointer hover:text-orange-400 transition-colors duration-200" />
            <FaShoppingCart className="cursor-pointer hover:text-orange-400 transition-colors duration-200" />
          </div>
          <Link to="/" className="block text-lg hover:text-orange-400 transition-colors duration-200">Inicio</Link>
          <Link to="/productos" className="block text-lg hover:text-orange-400 transition-colors duration-200">Productos</Link>
          <Link to="/ubicacion" className="block text-lg hover:text-orange-400 transition-colors duration-200">Ubicación</Link>
          <Link to="/nosotros" className="block text-lg hover:text-orange-400 transition-colors duration-200">Nosotros</Link>
          <Link to="/contacto" className="block text-lg hover:text-orange-400 transition-colors duration-200">Contacto</Link>
        </nav>
      )}
    </header>
  );
}

export default Header;
