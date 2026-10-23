import { Link } from "react-router-dom";
import { GiBarbecue } from "react-icons/gi";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Página no encontrada");

  return (
    <section className="w-full flex flex-col items-center justify-center bg-gray-950 px-6 py-24 min-h-[60vh] text-center">
      <GiBarbecue className="text-7xl text-orange-500 mb-6" />
      <h1 className="text-3xl md:text-4xl text-white mb-3">
        Esta página no existe
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Puede que el link esté mal escrito o que la página ya no esté disponible.
      </p>
      <Link
        to="/productos"
        className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white hover:text-white font-semibold transition-colors"
      >
        Ver productos
      </Link>
    </section>
  );
}
