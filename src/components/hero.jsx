import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import HeroImage from "../assets/heroexample-2.webp";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { FaArrowRight } from "react-icons/fa";

// Categorías y destacados: se descargan aparte para que la portada aparezca al instante
const HomeSections = lazy(() => import("./HomeSections.jsx"));

function Hero() {
  useDocumentTitle();

  return (
    <div className="w-full flex flex-col">
      {/* Más baja que la pantalla: se asoma lo de abajo e invita a seguir bajando */}
      <section className="relative w-full h-[70dvh] min-h-[26rem] max-h-[44rem] flex items-center justify-center">
        <img
          src={HeroImage}
          alt="Hero Los Molinos"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover brightness-45 blur-[3px]"
        />

        <div className="relative z-10 text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Bienvenido a<br/>Los <span className="text-orange-500">Molinos</span> Regionales
          </h1>
          <p className="mt-4 text-lg md:text-2xl text-stone-200 drop-shadow-md">
            Accesorios para tu parrilla en Dolores y la zona
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-3 mt-8 px-7 py-3.5 text-lg font-semibold rounded-full bg-orange-500 text-white hover:text-white hover:bg-orange-400 transition-colors"
          >
            Ver productos
            <FaArrowRight className="text-sm" />
          </Link>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-stone-950" />}>
        <HomeSections />
      </Suspense>
    </div>
  );
}

export default Hero;
