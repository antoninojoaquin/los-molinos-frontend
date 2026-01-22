import { useEffect, useState } from "react";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { BiCartDownload } from "react-icons/bi";

const CART_KEY = "cart";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    setCart(storedCart);
  }, []);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  };

  const increaseQty = (id) => {
    const updatedCart = cart.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updatedCart);
  };

  const decreaseQty = (id) => {
    const updatedCart = cart
      .map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
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

  if (cart.length === 0) {
    return (
      <section className="w-full flex flex-col bg-gray-950 px-6 md:px-16 py-12 items-center justify-center min-h-[60vh]">
        <BiCartDownload className="text-8xl text-orange-500 mb-4" />
        <p className="text-white/50 font-semibold text-xl">
          Tu carrito está vacío
        </p>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-950 px-6 md:px-24 py-12">
      <div className="flex flex-col gap-6">
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
              <p className="text-gray-200 font-medium">
                {item.name}
              </p>
              <p className="text-gray-400">
                ${item.price}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => decreaseQty(item.id)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <FaMinus />
              </button>

              <span className="text-white font-semibold">
                {item.quantity}
              </span>

              <button
                onClick={() => increaseQty(item.id)}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <FaPlus />
              </button>
            </div>

            <p className="text-white font-semibold w-24 text-right">
              ${item.price * item.quantity}
            </p>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-400 ml-4"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-10">
        <div className="bg-gray-800 p-6 rounded-lg w-full md:w-96">
          <p className="text-gray-400 mb-2">Total</p>
          <p className="text-2xl font-bold text-white mb-4">
            ${total}
          </p>

          <button className="w-full py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors cursor-pointer">
            Finalizar Compra
          </button>
        </div>
      </div>
    </section>
  );
}
