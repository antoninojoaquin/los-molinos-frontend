import { useState } from "react";
import { readStorage, writeStorage } from "../utils/storage";

const FAVORITES_KEY = "favorites";

// Favoritos guardados en el navegador: los usan el catálogo, Favoritos y el inicio
export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));

  const toggleFavorite = (productId) => {
    const updated = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    setFavorites(updated);
    writeStorage(FAVORITES_KEY, updated);
  };

  return { favorites, toggleFavorite };
}
