import { useCallback, useEffect, useRef, useState } from "react";
import { CartContext } from "./cartContext";
import { readStorage, writeStorage } from "../utils/storage";
import { isInStock } from "../utils/stock";
import { mainImage } from "../utils/image";

const CART_KEY = "cart";

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimeout = useRef(null);

  useEffect(() => {
    writeStorage(CART_KEY, cart);
  }, [cart]);

  // Mantiene el carrito sincronizado entre pestañas
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === CART_KEY) setCart(readStorage(CART_KEY, []));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => () => clearTimeout(justAddedTimeout.current), []);

  const getQuantity = (productId) =>
    cart.find((item) => item.id === productId)?.quantity ?? 0;

  const addToCart = (product) => {
    if (!isInStock(product)) return false;

    setCart((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: mainImage(product),
              quantity: 1,
            },
          ]
    );

    setJustAdded(true);
    clearTimeout(justAddedTimeout.current);
    justAddedTimeout.current = setTimeout(() => setJustAdded(false), 1500);
    return true;
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Ajusta el carrito al catálogo real de Firestore: actualiza precios y quita los productos
  // sin stock o dados de baja. Devuelve true si se quitó alguno.
  const syncStock = useCallback((products) => {
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    const current = readStorage(CART_KEY, []);

    const synced = current
      .filter((item) => productsById[item.id] && isInStock(productsById[item.id]))
      .map((item) => ({ ...item, price: productsById[item.id].price }));

    setCart(synced);
    return synced.length !== current.length;
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        justAdded,
        getQuantity,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        syncStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
