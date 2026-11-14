import { useCallback, useEffect, useState } from "react";
import { FaChevronDown, FaSearch, FaSlidersH, FaTimes } from "react-icons/fa";
import { SORTS } from "../utils/catalogFilters";

const formatAmount = (value) => (value == null ? "" : value.toLocaleString("es-AR"));
const parseAmount = (text) => {
  const digits = text.replace(/\D/g, "").slice(0, 9);
  return digits ? Number(digits) : null;
};

// Mismo alto y estilo para todos los controles: fondo apenas más claro que la página y borde sutil
const controlClass =
  "h-11 rounded-full bg-stone-900 border border-stone-800 text-white transition-colors focus-within:border-orange-500 hover:border-stone-700";

// Montos con "$" alineado al texto y puntos de miles (13.500). Texto y no number: sin flechitas
function AmountInput({ label, value, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-1 min-w-0 ${className}`}>
      <span className="text-stone-500">$</span>
      <input
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        placeholder={label}
        value={formatAmount(value)}
        onChange={(event) => onChange(parseAmount(event.target.value))}
        className="w-full min-w-0 bg-transparent text-white placeholder-stone-500 focus:outline-none"
      />
    </label>
  );
}

function PriceRange({ filters, onChange }) {
  return (
    <div className={`${controlClass} flex items-center gap-3 px-4 text-sm`}>
      <span className="text-stone-400 shrink-0">Precio</span>
      <AmountInput label="Mín." value={filters.min} onChange={(min) => onChange({ min })} className="w-20" />
      <span className="text-stone-600">–</span>
      <AmountInput label="Máx." value={filters.max} onChange={(max) => onChange({ max })} className="w-20" />
    </div>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <label className={`${controlClass} relative flex items-center text-sm`}>
      <span className="sr-only">Ordenar</span>
      <select
        value={value}
        onChange={(event) => onChange({ sort: event.target.value })}
        className="h-full appearance-none bg-transparent pl-4 pr-10 cursor-pointer focus:outline-none"
      >
        {Object.entries(SORTS).map(([key, label]) => (
          <option key={key} value={key} className="bg-stone-900">
            {label}
          </option>
        ))}
      </select>
      <FaChevronDown className="pointer-events-none absolute right-4 text-xs text-stone-400" />
    </label>
  );
}

// Panel que sube desde abajo en celular, con precio y orden
function FiltersSheet({ filters, onChange, onClear, shown, onClose }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/70 animate-fadeIn md:hidden" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded-t-3xl bg-stone-900 p-5 flex flex-col gap-6 animate-slideUp"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
      >
        <div className="flex items-center justify-between">
          <h2 id="filters-title" className="text-white text-xl">Filtros</h2>
          <button onClick={onClose} aria-label="Cerrar filtros" className="p-2 -mr-2 text-stone-400 hover:text-white cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-stone-400">Precio</p>
          <div className="flex items-center gap-3">
            <div className={`${controlClass} flex-1 flex items-center px-4`}>
              <AmountInput label="Mínimo" value={filters.min} onChange={(min) => onChange({ min })} className="w-full" />
            </div>
            <span className="text-stone-600">–</span>
            <div className={`${controlClass} flex-1 flex items-center px-4`}>
              <AmountInput label="Máximo" value={filters.max} onChange={(max) => onChange({ max })} className="w-full" />
            </div>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-stone-400 mb-2">Ordenar por</legend>
          {Object.entries(SORTS).map(([key, label]) => (
            <label
              key={key}
              className={`flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                filters.sort === key ? "bg-orange-500/15 text-orange-300" : "bg-stone-800/60 text-stone-200"
              }`}
            >
              {label}
              <input
                type="radio"
                name="sort"
                value={key}
                checked={filters.sort === key}
                onChange={() => onChange({ sort: key })}
                className="accent-orange-500 w-4 h-4"
              />
            </label>
          ))}
        </fieldset>

        <div className="flex items-center gap-3">
          <button onClick={onClear} className="px-4 py-3 text-stone-300 hover:text-white cursor-pointer">
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold cursor-pointer"
          >
            Ver {shown} {shown === 1 ? "producto" : "productos"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Lupa de búsqueda, categorías, rango de precio y orden. El estado vive en la URL (ver utils/catalogFilters.js)
export default function CatalogFilters({ filters, onChange, onClear, categories, total, shown, active }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  // Cantidad de filtros del panel de celular aplicados (para el numerito del botón)
  const sheetCount = [filters.min != null, filters.max != null, filters.sort !== "relevance"].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex gap-3">
        <label className={`${controlClass} relative flex-1 flex items-center`}>
          <span className="sr-only">Buscar productos</span>
          <FaSearch className="pointer-events-none absolute left-4 text-stone-500" />
          <input
            type="search"
            placeholder="Buscar productos"
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value })}
            className="h-full w-full bg-transparent pl-11 pr-10 placeholder-stone-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.q && (
            <button
              onClick={() => onChange({ q: "" })}
              aria-label="Borrar búsqueda"
              className="absolute right-3 p-1.5 text-stone-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </label>

        {/* Escritorio: precio y orden a la vista */}
        <div className="hidden md:flex gap-3">
          <PriceRange filters={filters} onChange={onChange} />
          <SortSelect value={filters.sort} onChange={onChange} />
        </div>

        {/* Celular: un botón que abre el panel de filtros */}
        <button
          onClick={() => setSheetOpen(true)}
          className={`${controlClass} md:hidden relative flex items-center gap-2 px-4 text-sm cursor-pointer`}
        >
          <FaSlidersH className="text-stone-400" />
          Filtros
          {sheetCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
              {sheetCount}
            </span>
          )}
        </button>
      </div>

      {/* Categorías como pestañas, con el mismo subrayado naranja que el menú. En celular se deslizan
          de costado, sin barra de scroll, y un degradé en el borde avisa que hay más */}
      <div className="relative border-b border-stone-800">
        <div
          role="group"
          aria-label="Categorías"
          className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-8 md:pr-0"
        >
          {[{ name: "", label: "Todas", count: total }, ...categories].map(({ name, label, count }) => {
            const selected = filters.cat === name;
            return (
              <button
                key={name || "all"}
                onClick={() => onChange({ cat: name })}
                aria-pressed={selected}
                className={`relative shrink-0 pb-3 pt-1 text-sm md:text-base whitespace-nowrap transition-colors cursor-pointer ${
                  selected ? "text-orange-500 font-semibold" : "text-stone-400 hover:text-white"
                }`}
              >
                {label ?? name}
                <span className={`ml-1.5 text-xs ${selected ? "text-orange-300" : "text-stone-600"}`}>{count}</span>
                {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-px w-10 bg-gradient-to-l from-stone-950 md:hidden" />
      </div>

      <div className="flex items-center justify-between text-sm text-stone-500 -mt-1">
        <p aria-live="polite">{active ? `${shown} de ${total} productos` : `${total} productos`}</p>
        {active && (
          <button onClick={onClear} className="text-orange-400 hover:text-orange-300 cursor-pointer">
            Limpiar filtros
          </button>
        )}
      </div>

      {sheetOpen && (
        <FiltersSheet
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          shown={shown}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
