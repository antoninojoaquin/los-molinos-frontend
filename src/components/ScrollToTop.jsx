import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  // Solo la primera parte de la ruta: abrir/cerrar /productos/:id no debe mover el scroll
  const section = pathname.split("/")[1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  return null;
};

export default ScrollToTop;
