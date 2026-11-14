import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "../utils/formatPrice";
import { mainImage, optimizeImage } from "../utils/image";
import { isInStock } from "../utils/stock";

// Tarjeta de producto del catálogo y del inicio. `to` es a dónde lleva (el detalle del producto)
export default function ProductCard({ product, to, isFavorite, onToggleFavorite }) {
  const outOfStock = !isInStock(product);
  const image = mainImage(product);

  return (
    <article className="group relative overflow-hidden bg-gray-800 rounded-3xl shadow-lg flex flex-col">
      {/* Foto entera (las fotos son cuadradas, con fondo crema): no se recorta ningún producto */}
      <div className="relative aspect-square overflow-hidden bg-photo">
        <img
          className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale opacity-70" : ""}`}
          src={optimizeImage(image, 800)}
          srcSet={`${optimizeImage(image, 400)} 400w, ${optimizeImage(image, 800)} 800w`}
          sizes="(min-width: 1024px) 25vw, 50vw"
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Toda la card abre el detalle; favoritos y carrito quedan por encima */}
      <Link
        to={to}
        state={{ fromList: true }}
        aria-label={`Ver detalle de ${product.name}`}
        className="absolute inset-0 z-[5] rounded-3xl focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:-outline-offset-2"
      />

      {outOfStock && (
        <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 max-w-[calc(100%-3.75rem)] truncate text-white text-[11px] md:text-xs font-semibold md:uppercase md:tracking-wide px-2 md:px-2.5 py-1 rounded-full shadow bg-gray-600">
          Sin stock
        </span>
      )}

      <button
        onClick={() => onToggleFavorite(product.id)}
        aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
        aria-pressed={isFavorite}
        className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 p-1.5 md:p-2 rounded-full bg-black/55 cursor-pointer transition-colors duration-200 hover:text-orange-300
          ${isFavorite ? "text-orange-500" : "text-white"}
        `}
      >
        <FaHeart className="text-base md:text-xl" />
      </button>

      <div className="pointer-events-none relative z-10 flex-1 w-full p-3 md:p-4 flex flex-col gap-1">
        <p className="text-orange-300 uppercase tracking-wide text-[10px] md:text-xs truncate">
          {product.category}
        </p>

        <h3 className="text-white font-bold text-sm md:text-lg leading-tight line-clamp-2 min-h-[2lh]">
          {product.name}
        </h3>

        <p className="text-white font-extrabold text-lg md:text-2xl mt-auto pt-1">
          {formatPrice(product.price)}
        </p>

        <div className="pointer-events-auto mt-2">
          <AddToCartButton product={product} className="py-2.5 text-xs md:text-sm" />
        </div>
      </div>
    </article>
  );
}
