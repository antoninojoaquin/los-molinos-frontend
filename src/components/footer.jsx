import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import Logo from "../assets/logofooter.png";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-2">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="Los Molinos Regionales" className="h-32 md:h-32" />
          <span className="text-lg md:text-xl font-medium">
            Accesorios de calidad para tu parrilla
          </span>
        </div>

        <div className="text-center md:text-left space-y-2">
            <p><span className="text-orange-500 font-medium">Email:</span> lmregionales@gmail.com</p>
            <p><span className="text-orange-500 font-medium">Tel:</span> +54 9 2245 42-9517</p>
            <p><span className="text-orange-500 font-medium">Dirección:</span> Aristobulo Del Valle 178, Dolores, Buenos Aires</p>
        </div>

        <div className="flex justify-start space-x-6 text-2xl md:ml-4">
        <a
            href="https://www.facebook.com/listo.elpollo.54"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors duration-200"
        >
            <FaFacebookF />
        </a>
        <a
            href="https://www.instagram.com/lmregionales/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors duration-200"
        >
            <FaInstagram />
        </a>
        <a
            href="https://wa.me/5492245429517"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors duration-200"
        >
            <FaWhatsapp />
        </a>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © 2026 Los Molinos Regionales. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
