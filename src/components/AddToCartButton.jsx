import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import cartAnimation from "../assets/shopping-cart.json";
import { useCart } from "../context/cartContext";
import { FaCartPlus, FaCheck } from "react-icons/fa";
import { isInStock } from "../utils/stock";

const LABELS = ["Agregar al carrito", "Sin stock"];

// Confirmación "agregado" breve: el botón no se bloquea, otro toque suma otra unidad al instante
const FEEDBACK_MS = 900;

// variant: "full" (detalle, con texto), "wide" (tarjetas, ancho completo) o "compact" (redondo, solo ícono)
export default function AddToCartButton({ product, className = "", variant = "full" }) {
  const { addToCart } = useCart();
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimeout = useRef(null);

  useEffect(() => () => clearTimeout(cooldownTimeout.current), []);

  const outOfStock = !isInStock(product);
  const currentLabel = outOfStock ? "Sin stock" : "Agregar al carrito";

  const handleClick = () => {
    if (!addToCart(product)) return;
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
        className={`group/btn w-full h-10 md:h-11 px-3 rounded-full flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap ${
          cooldown
            ? "bg-green-600 text-white"
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
        className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center ${
          cooldown
            ? "bg-green-600 text-white"
            : outOfStock
              ? "bg-stone-800 text-stone-600 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-400 cursor-pointer"
        } ${className}`}
      >
        {cooldown ? <FaCheck /> : <FaCartPlus className="text-base md:text-lg" />}
      </button>
    );
  }

  return (
    <button
      disabled={outOfStock}
      onClick={handleClick}
      className={`relative w-full text-white font-semibold px-3 rounded-full transition-colors
        ${
          cooldown
            ? "bg-stone-500"
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
            aria-hidden={label !== currentLabel || cooldown}
            className={`[grid-area:1/1] text-center leading-tight ${
              label === currentLabel && !cooldown ? "" : "invisible"
            }`}
          >
            {label}
          </span>
        ))}
      </span>

      {cooldown && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Lottie
            animationData={cartAnimation}
            loop={false}
            className="w-5 h-5 scale-[2]"
          />
        </span>
      )}
    </button>
  );
}
