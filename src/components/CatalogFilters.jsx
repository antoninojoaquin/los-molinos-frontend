import { FaSearch, FaTimes } from "react-icons/fa";
import { SORTS } from "../utils/catalogFilters";

const formatAmount = (value) => (value == null ? "" : value.toLocaleString("es-AR"));
const parseAmount = (text) => {
  const digits = text.replace(/\D/g, "").slice(0, 9);
  return digits ? Number(digits) : null;
};

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-orange-500";

function PriceInput({ label, value, onChange }) {
  return (
    <label className="relative flex-1 min-w-0">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
      {/* Texto y no number: sin flechitas, y con puntos de miles (13.500) */}
      <input
        inputMode="numeric"
        autoComplete="off"
        placeholder={label}
        value={formatAmount(value)}
        onChange={(event) => onChange(parseAmount(event.target.value))}
        className={`${inputClass} pl-7 pr-3 py-2 text-sm`}
      />
    </label>
  );
}

// Lupa de búsqueda, categorías, rango de precio y orden. El estado vive en la URL (ver utils/catalogFilters.js)
export default function CatalogFilters({ filters, onChange, onClear, categories, total, shown, active }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Buscar productos</span>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar productos…"
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value })}
            className={`${inputClass} pl-11 pr-10 py-2.5 [&::-webkit-search-cancel-button]:hidden`}
          />
          {filters.q && (
            <button
              onClick={() => onChange({ q: "" })}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </label>

        <div className="flex gap-2 md:w-[28rem]">
          <PriceInput label="Desde" value={filters.min} onChange={(min) => onChange({ min })} />
          <PriceInput label="Hasta" value={filters.max} onChange={(max) => onChange({ max })} />
          <label className="flex-1 min-w-0">
            <span className="sr-only">Ordenar</span>
            <select
              value={filters.sort}
              onChange={(event) => onChange({ sort: event.target.value })}
              className={`${inputClass} px-3 py-2 text-sm cursor-pointer`}
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* En celular las categorías se deslizan de costado */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap" role="group" aria-label="Categorías">
        {[{ name: "", label: "Todas", count: total }, ...categories].map(({ name, label, count }) => {
          const selected = filters.cat === name;
          return (
            <button
              key={name || "all"}
              onClick={() => onChange({ cat: name })}
              aria-pressed={selected}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                selected ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {label ?? name} <span className={selected ? "text-white/80" : "text-gray-500"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <p aria-live="polite">
          {active ? `${shown} de ${total} productos` : `${total} productos`}
        </p>
        {active && (
          <button onClick={onClear} className="text-orange-400 hover:text-orange-300 cursor-pointer">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
