import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import HeroImage from "../assets/heroexample-2.webp";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { fetchProducts } from "../services/products";
import { getCategories } from "../utils/catalogFilters";

// Destacados: se descargan aparte para que la portada aparezca al instante
const HomeSections = lazy(() => import("./HomeSections.jsx"));

const categoryLink = (name) => ({ pathname: "/productos", search: `?cat=${encodeURIComponent(name)}` });

// Las categorías salen del catálogo (catalog.json, unos pocos KB): si se agrega una nueva, aparece sola
function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetchProducts()
      .then((products) => setCategories(getCategories(products)))
      .catch(() => setCategories([]));
  }, []);
  return categories;
}

function Headline() {
  return (
    <>
      <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
        Bienvenido a<br />Los <span className="text-orange-500">Molinos</span> Regionales
      </h1>
      <p className="mt-4 text-lg md:text-2xl text-stone-200 drop-shadow-md">
        Accesorios para tu parrilla en Dolores y la zona
      </p>
    </>
  );
}

// Opción A: el botón pasa a ser un buscador, con las categorías como links de texto debajo
function SearchHero({ categories }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? { pathname: "/productos", search: `?q=${encodeURIComponent(q)}` } : "/productos");
  };

  return (
    <div className="relative z-10 w-full max-w-4xl text-center px-4">
      <Headline />

      <form onSubmit={handleSubmit} role="search" className="relative mt-8 mx-auto max-w-xl flex items-center">
        <label htmlFor="hero-search" className="sr-only">Buscar productos</label>
        <FaSearch className="pointer-events-none absolute left-5 z-10 text-stone-400" />
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="¿Qué estás buscando?"
          className="w-full h-14 rounded-full bg-stone-950/75 backdrop-blur border border-stone-700 pl-12 pr-16 text-lg text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-2 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center cursor-pointer"
        >
          <FaArrowRight />
        </button>
      </form>

      {/* Reserva el alto mientras carga el catálogo, para que no salte el contenido */}
      <nav aria-label="Categorías" className="mt-5 mx-auto max-w-2xl min-h-[3.5rem] flex flex-wrap justify-center gap-x-1 gap-y-1 text-sm md:text-base">
        {categories.map(({ name }) => (
          <Link
            key={name}
            to={categoryLink(name)}
            className="px-2 py-1 font-normal text-stone-300 hover:text-white drop-shadow underline-offset-4 hover:underline"
          >
            {name}
          </Link>
        ))}
        {categories.length > 0 && (
          <Link to="/productos" className="px-2 py-1 text-orange-400 hover:text-orange-300 drop-shadow">
            Ver todo
          </Link>
        )}
      </nav>
    </div>
  );
}

// Opción B: el botón de siempre, y una franja de categorías al pie de la portada, como un menú
function StripHero({ categories }) {
  return (
    <>
      <div className="relative z-10 text-center px-4 md:px-8 pb-24 md:pb-28">
        <Headline />
        <Link
          to="/productos"
          className="inline-flex items-center gap-3 mt-8 px-7 py-3.5 text-lg font-semibold rounded-full bg-orange-500 text-white hover:text-white hover:bg-orange-400 transition-colors"
        >
          Ver productos
          <FaArrowRight className="text-sm" />
        </Link>
      </div>

      <nav
        aria-label="Categorías"
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-stone-950/70 backdrop-blur"
      >
        {/* En celular se desliza de costado, sin barra de scroll */}
        <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6">
          {categories.map(({ name, count }) => (
            <li key={name} className="shrink-0 border-r border-white/10 last:border-r-0">
              <Link to={categoryLink(name)} className="group block px-5 md:px-6 py-4 md:py-5 font-normal">
                <span className="block text-white font-semibold whitespace-nowrap md:whitespace-normal leading-tight group-hover:text-orange-400 transition-colors">
                  {name}
                </span>
                <span className="block text-stone-400 text-sm mt-0.5">
                  {count} {count === 1 ? "producto" : "productos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function Hero() {
  useDocumentTitle();
  const categories = useCategories();
  // Temporal, para comparar las dos opciones: /?hero=a (buscador) o /?hero=b (franja)
  const [searchParams] = useSearchParams();
  const variant = searchParams.get("hero") === "b" ? "b" : "a";

  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full h-[78dvh] min-h-[32rem] max-h-[48rem] flex items-center justify-center overflow-hidden">
        <img
          src={HeroImage}
          alt=""
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover brightness-45 blur-[3px]"
        />
        {variant === "a" ? <SearchHero categories={categories} /> : <StripHero categories={categories} />}
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-stone-950" />}>
        <HomeSections />
      </Suspense>
    </div>
  );
}

export default Hero;
