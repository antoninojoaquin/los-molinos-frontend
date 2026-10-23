import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import cartAnimation from "../assets/shopping-cart.json";
import { useCart } from "../context/cartContext";
import { getStock } from "../utils/stock";

const LABELS = ["Agregar al carrito", "Máximo en carrito", "Sin stock"];

export default function AddToCartButton({ product, className = "" }) {
  const { addToCart, getQuantity } = useCart();
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimeout = useRef(null);

  useEffect(() => () => clearTimeout(cooldownTimeout.current), []);

  const stock = getStock(product);
  const outOfStock = stock <= 0;
  const maxInCart = !outOfStock && getQuantity(product.id) >= stock;
  const currentLabel = outOfStock
    ? "Sin stock"
    : maxInCart
      ? "Máximo en carrito"
      : "Agregar al carrito";

  const handleClick = () => {
    if (!addToCart(product)) return;
    setCooldown(true);
    clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => setCooldown(false), 2000);
  };

  return (
    <button
      disabled={cooldown || outOfStock || maxInCart}
      onClick={handleClick}
      className={`relative w-full text-white font-semibold px-3 rounded-full transition-colors
        ${
          cooldown
            ? "bg-gray-500"
            : outOfStock || maxInCart
              ? "bg-gray-600 cursor-not-allowed"
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
