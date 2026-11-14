import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/cartContext";
import { FaCartPlus, FaCheck } from "react-icons/fa";
import { isInStock } from "../utils/stock";
import Burst from "./Burst";
import useBurst from "../hooks/useBurst";

// Todas las etiquetas del botón del detalle: ocupan la misma celda, así el botón no cambia de tamaño
const LABELS = ["Agregar al carrito", "Sin stock", "Agregado"];

// Confirmación "agregado" breve: el botón no se bloquea, otro toque suma otra unidad al instante
const FEEDBACK_MS = 900;

// variant: "full" (detalle, con texto), "wide" (tarjetas, ancho completo) o "compact" (redondo, solo ícono)
export default function AddToCartButton({ product, className = "", variant = "full" }) {
  const { addToCart } = useCart();
  const [cooldown, setCooldown] = useState(false);
  const [sparks, fireSparks] = useBurst();
  const cooldownTimeout = useRef(null);

  useEffect(() => () => clearTimeout(cooldownTimeout.current), []);

  const outOfStock = !isInStock(product);
  const currentLabel = outOfStock ? "Sin stock" : cooldown ? "Agregado" : "Agregar al carrito";

  const handleClick = () => {
    if (!addToCart(product)) return;
    fireSparks();
    setCooldown(true);
    clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => setCooldown(false), FEEDBACK_MS);
  };

  if (variant === "wide") {
    return (
      <button
        disabled={outOfStock}
        onClick={handleClick}
        aria-label={outOfStock ? `${product.name}: sin stock` : `Agregar ${product.name} al carrito`}
        // Sin transición al cambiar a "Agregado": el cambio se ve en el mismo instante del toque
        className={`group/btn relative w-full h-10 md:h-11 px-3 rounded-full flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap ${
          cooldown
            ? "bg-orange-600 text-white"
            : outOfStock
              ? "bg-stone-800 text-stone-500 cursor-not-allowed"
              : "bg-stone-800 text-stone-100 hover:bg-orange-500 hover:text-white active:bg-orange-600 cursor-pointer"
        } ${className}`}
      >
        {cooldown ? <FaCheck /> : !outOfStock && <FaCartPlus className="text-orange-400 group-hover/btn:text-white" />}
        {/* El texto aparece solo si entra (tarjetas angostas: solo el ícono) */}
        <span className={outOfStock ? "" : "hidden @[11rem]:inline"}>
          {cooldown ? "Agregado" : outOfStock ? "Sin stock" : "Agregar"}
        </span>
        <Burst kind="sparks" burstKey={sparks} />
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        disabled={outOfStock}
        onClick={handleClick}
        aria-label={outOfStock ? `${product.name}: sin stock` : cooldown ? "Agregado al carrito" : `Agregar ${product.name} al carrito`}
        title={outOfStock ? "Sin stock" : "Agregar al carrito"}
        className={`relative shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center ${
          cooldown
            ? "bg-orange-600 text-white"
            : outOfStock
              ? "bg-stone-800 text-stone-600 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-400 cursor-pointer"
        } ${className}`}
      >
        {cooldown ? <FaCheck /> : <FaCartPlus className="text-base md:text-lg" />}
        <Burst kind="sparks" burstKey={sparks} />
      </button>
    );
  }

  return (
    <button
      disabled={outOfStock}
      onClick={handleClick}
      className={`relative w-full text-white font-semibold px-3 rounded-full
        ${
          cooldown
            ? "bg-orange-600"
            : outOfStock
              ? "bg-stone-600 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-400 cursor-pointer"
        }
        ${className}
      `}
    >
      {/* Todas las etiquetas ocupan la misma celda: el botón siempre mide lo que la más larga */}
      <span className="grid justify-items-center">
        {LABELS.map((label) => (
          <span
            key={label}
            aria-hidden={label !== currentLabel}
            className={`[grid-area:1/1] flex items-center gap-2 text-center leading-tight ${
              label === currentLabel ? "" : "invisible"
            }`}
          >
            {label === "Agregado" && <FaCheck />}
            {label}
          </span>
        ))}
      </span>
      <Burst kind="sparks" burstKey={sparks} />
    </button>
  );
}
