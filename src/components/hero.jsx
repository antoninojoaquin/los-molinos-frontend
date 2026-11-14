import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaSearch } from "react-icons/fa";
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
      <h1 className="text-4xl md:text-6xl font-bold text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.55)]">
        Bienvenido a<br />Los <span className="text-orange-500">Molinos</span> Regionales
      </h1>
      <p className="mt-4 text-lg md:text-2xl text-stone-200 [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]">
        Accesorios para tu parrilla en Dolores y la zona
      </p>
    </>
  );
}

// Portada: el buscador es la acción principal, y debajo las categorías como pills
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
          className="w-full h-14 rounded-full bg-stone-950/80 border border-stone-700 pl-12 pr-16 text-lg text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 [&::-webkit-search-cancel-button]:hidden"
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
      {/* Pills con fondo propio (oscuro, semitransparente): se leen sobre cualquier parte del fuego */}
      <nav aria-label="Categorías" className="mt-6 mx-auto max-w-2xl min-h-[5.5rem] flex flex-wrap justify-center gap-2">
        {categories.map(({ name }) => (
          <Link
            key={name}
            to={categoryLink(name)}
            className="px-4 py-2 rounded-full bg-stone-950/75 border border-white/15 text-sm md:text-[15px] font-medium text-stone-100 hover:text-white hover:bg-stone-900/90 hover:border-white/30 transition-colors"
          >
            {name}
          </Link>
        ))}
        {categories.length > 0 && (
          <Link
            to="/productos"
            className="px-4 py-2 rounded-full bg-stone-950/75 border border-orange-500/60 text-sm md:text-[15px] font-medium text-orange-300 hover:text-orange-200 hover:border-orange-400 transition-colors"
          >
            Ver todo
          </Link>
        )}
      </nav>
    </div>
  );
}

function Hero() {
  useDocumentTitle();
  const categories = useCategories();

  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full h-[78dvh] min-h-[32rem] max-h-[48rem] flex items-center justify-center overflow-hidden">
        {/* Tres tamaños (public/images): el celular baja el chico. La misma lista se precarga en index.html.
            La foto ya viene desenfocada y oscurecida: aplicar blur/brightness con CSS es muy caro en celulares */}
        <img
          src="/images/hero-blur-1024.webp"
          srcSet="/images/hero-blur-640.webp 640w, /images/hero-blur-1024.webp 1024w, /images/hero-blur-1600.webp 1600w"
          sizes="100vw"
          width="1600"
          height="1142"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <SearchHero categories={categories} />
      </section>

      <Suspense fallback={<div className="min-h-[40vh] bg-stone-950" />}>
        <HomeSections />
      </Suspense>
    </div>
  );
}

export default Hero;
