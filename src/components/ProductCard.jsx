import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";
import Burst from "./Burst";
import useBurst from "../hooks/useBurst";
import { formatPrice } from "../utils/formatPrice";
import { mainImage, optimizeImage } from "../utils/image";
import { isInStock } from "../utils/stock";

// Lugar reservado mientras carga el catálogo: mismo tamaño que una tarjeta real
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-2xl bg-stone-900 flex flex-col animate-pulse">
      <div className="aspect-square rounded-t-2xl bg-stone-800/60" />
      <div className="p-3 md:p-4 flex flex-col gap-2">
        <div className="h-3 w-1/3 rounded bg-stone-800" />
        <div className="h-4 w-4/5 rounded bg-stone-800" />
        <div className="h-4 w-2/5 rounded bg-stone-800 mb-1" />
        <div className="h-10 md:h-11 rounded-full bg-stone-800" />
      </div>
    </div>
  );
}

// Tarjeta de producto del catálogo y del inicio. `to` es a dónde lleva (el detalle del producto).
// priority: las primeras tarjetas del catálogo cargan la foto de inmediato (son lo primero que se ve)
export default function ProductCard({ product, to, isFavorite, onToggleFavorite, priority = false }) {
  const outOfStock = !isInStock(product);
  const image = mainImage(product);
  const [heartBurst, fireHeartBurst] = useBurst();

  return (
    <article className="group relative bg-stone-900 rounded-2xl flex flex-col">
      {/* Foto entera (las fotos son cuadradas, con fondo crema): no se recorta ningún producto */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-photo">
        <img
          className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "grayscale opacity-70" : ""}`}
          src={optimizeImage(image, 800)}
          srcSet={`${optimizeImage(image, 400)} 400w, ${optimizeImage(image, 800)} 800w`}
          sizes="(min-width: 1024px) 25vw, 50vw"
          alt={product.name}
          width="800"
          height="800"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>

      {/* Toda la card abre el detalle; favoritos y carrito quedan por encima */}
      <Link
        to={to}
        state={{ fromList: true }}
        aria-label={`Ver detalle de ${product.name}`}
        className="absolute inset-0 z-[5] rounded-2xl focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:-outline-offset-2"
      />

      {outOfStock && (
        <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 max-w-[calc(100%-3.75rem)] truncate text-stone-200 text-[11px] md:text-xs font-medium px-2 md:px-2.5 py-1 rounded-full bg-stone-900/85">
          Sin stock
        </span>
      )}

      <button
        onClick={() => {
          if (onToggleFavorite(product.id)) fireHeartBurst();
        }}
        aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
        aria-pressed={isFavorite}
        className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 p-2 rounded-full bg-stone-900/70 cursor-pointer transition-colors duration-200 hover:text-orange-300
          ${isFavorite ? "text-orange-500" : "text-stone-300"}
        `}
      >
        <FaHeart className="text-sm md:text-base" />
        <Burst kind="hearts" burstKey={heartBurst} />
      </button>

      <div className="pointer-events-none relative z-10 flex-1 w-full p-3 md:p-4 flex flex-col gap-1">
        <p className="text-stone-400 text-xs truncate">{product.category}</p>

        <h3 className="text-stone-100 font-semibold text-sm md:text-base leading-snug line-clamp-2 min-h-[2lh]">
          {product.name}
        </h3>

        {/* Precio y botón comparten la fila: el botón ocupa el resto del ancho.
            @container: si la tarjeta es angosta, el botón muestra solo el ícono */}
        <div className="@container mt-auto pt-2 flex items-center gap-3 md:gap-4">
          <p className={`shrink-0 font-bold text-base md:text-xl ${outOfStock ? "text-stone-400" : "text-orange-400"}`}>
            {formatPrice(product.price)}
          </p>
          <div className="pointer-events-auto flex-1 min-w-0">
            <AddToCartButton product={product} variant="wide" />
          </div>
        </div>
      </div>
    </article>
  );
}
