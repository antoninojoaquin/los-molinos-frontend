import { useEffect, useRef, useState } from "react";
import { FavoritesContext } from "./favoritesContext";
import { readStorage, writeStorage } from "../utils/storage";

const FAVORITES_KEY = "favorites";

// Favoritos compartidos por toda la web (catálogo, inicio y el contador del header),
// guardados en el navegador y sincronizados entre pestañas
export default function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  // Se activa un instante al agregar un favorito: el corazón del header da un saltito
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimeout = useRef(null);

  useEffect(() => {
    writeStorage(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === FAVORITES_KEY) setFavorites(readStorage(FAVORITES_KEY, []));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => () => clearTimeout(justAddedTimeout.current), []);

  // Devuelve true si quedó como favorito (para disparar la animación en el botón)
  const toggleFavorite = (productId) => {
    const adding = !favorites.includes(productId);
    setFavorites((prev) => (adding ? [...prev, productId] : prev.filter((id) => id !== productId)));
    if (adding) {
      setJustAdded(true);
      clearTimeout(justAddedTimeout.current);
      justAddedTimeout.current = setTimeout(() => setJustAdded(false), 500);
    }
    return adding;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, justAdded }}>
      {children}
    </FavoritesContext.Provider>
  );
}
