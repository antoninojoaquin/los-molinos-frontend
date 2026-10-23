import { useEffect, useState } from "react";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { BiCartDownload } from "react-icons/bi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const CART_KEY = "cart";

const getStock = (item) => item.stock ?? Infinity;

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [stockAdjusted, setStockAdjusted] = useState(false);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    setCart(storedCart);

    if (storedCart.length === 0) return;

    // El stock guardado en localStorage puede estar desactualizado
    const syncStock = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const stockById = Object.fromEntries(
          querySnapshot.docs.map((doc) => [doc.id, doc.data().stock])
        );

        let adjusted = false;
        const syncedCart = storedCart
          .map((item) => {
            const stock = stockById[item.id];
            const quantity = Math.min(item.quantity, stock ?? Infinity);
            if (quantity !== item.quantity) adjusted = true;
            return { ...item, stock, quantity };
          })
          .filter((item) => item.quantity > 0);

        updateCart(syncedCart);
        setStockAdjusted(adjusted);
      } catch (error) {
        console.error("Error al sincronizar stock:", error);
      }
    };

    syncStock();
  }, []);

  const increaseQty = (id) => {
    const updatedCart = cart.map(item =>
      item.id === id && item.quantity < getStock(item)
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updatedCart);
  };

  const decreaseQty = (id) => {
    const updatedCart = cart
      .map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
      .filter(item => item.quantity > 0);

    updateCart(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    updateCart(updatedCart);
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    const productList = cart
      .map(item => `• ${item.name} x${item.quantity}`)
      .join("\n");

    const message = `¡Hola! estoy interesado en:\n${productList}\n\nPrecio total: $${total}\n¿Podemos coordinar los detalles?`;

    const url = `https://wa.me/542245502977?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const stockNotice = stockAdjusted && (
    <p className="text-orange-300 text-sm text-center mb-6">
      Algunos productos se ajustaron según el stock disponible.
    </p>
  );

  if (cart.length === 0) {
    return (
      <section className="w-full flex flex-col bg-gray-950 px-6 md:px-16 py-12 items-center justify-center min-h-[60vh]">
        {stockNotice}
        <BiCartDownload className="text-8xl text-orange-500 mb-4" />
        <p className="text-white/50 font-semibold text-xl">
          Tu carrito está vacío
        </p>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-950 px-2 md:px-24 py-12">
      {stockNotice}
      <div className="flex flex-col md:flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="flex flex-col gap-6 flex-1">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />

              <div className="flex-1">
                <p className="text-gray-200 text-xs font-medium">
                  {item.name}
                </p>
                <p className="text-gray-400 text-sm">
                  ${item.price}
                </p>
              </div>

              <div className="flex items-center scale-80 gap-3 border-gray-950 border-2 rounded-full">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 cursor-pointer"
                >
                  <FaMinus />
                </button>

                <span className="text-white font-semibold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQty(item.id)}
                  disabled={item.quantity >= getStock(item)}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-col gap-2 md:flex-row justify-center items-center -ml-4 md:ml-0">
                <p className="text-white font-semibold w-24 text-lg md:text-xl text-center">
                  ${item.price * item.quantity}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-orange-500 text-lg hover:text-orange-400 cursor-pointer"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <div className="bg-gray-800 p-6 rounded-lg w-fullmd:w-96">
            <p className="text-gray-400 mb-2">Total</p>
            <p className="text-2xl font-bold text-white mb-4">
              ${total}
            </p>

            <button
              onClick={handleCheckout}
              className="w-full py-3 px-6 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors cursor-pointer">
              Continuar pedido por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
