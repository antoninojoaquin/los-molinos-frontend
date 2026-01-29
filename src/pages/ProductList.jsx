import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Lottie from "lottie-react";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import loadingAnimation from "../assets/loading.json";
import cartAnimation from "../assets/shopping-cart.json";

const FAVORITES_KEY = "favorites";
const CART_KEY = "cart";

export default function ProductList({ showOnlyFavorites = false, triggerCartSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [cooldownId, setCooldownId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (error) {
        console.error("Error al traer productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const storedFavorites =
      JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    setCart(storedCart);
  }, []);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    let updatedCart;

    if (existingProduct) {
      updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    }

    setCart(updatedCart);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
  };

  const toggleFavorite = (productId) => {
    let updatedFavorites;

    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter((id) => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  const displayedProducts = products.filter(
    (product) => !showOnlyFavorites || favorites.includes(product.id)
  );

  if (loading) {
    return (
      <div className="flex bg-gray-950 justify-center items-center h-128 w-full">
        <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
      </div>
    );
  }

  return (
    <section className="w-full bg-gray-950 px-6 md:px-16 py-12 min-h-[50vh]">
      {showOnlyFavorites && displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-20 text-white/50">
          <FaHeartBroken className="text-6xl text-orange-500 mb-4" />
          <p className="text-xl font-semibold text-center">
            No tienes nada en favoritos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedProducts.map((product) => (
            <div
              key={product.id} 
              className="relative overflow-hidden p-1 md:p-2 bg-gray-800 rounded-3xl shadow flex flex-col h-96"
            >
              <img
                className="absolute inset-0 object-cover h-full w-full rounded-3xl"
                src={product.imageUrl}
                alt={product.name}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />

              <FaHeart
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-2 right-2 text-[40px] z-10 cursor-pointer transition-colors p-2 bg-black/50 rounded-4xl duration-200
                  ${
                    favorites.includes(product.id)
                      ? "hover:text-orange-300 text-orange-500"
                      : "hover:text-orange-300 text-white"
                  }
                `}
              />
              <div className="relative z-10 mt-auto w-full p-2 ">
                <p className="relative z-10 text-orange-300 uppercase mb-2 text-[11px] md:text-xs">
                  {product.category}
                </p>

                <p className="relative z-10 text-white font-bold text-md md:text-xl">
                  {product.name}
                </p>

                <div className="gap-2 flex items-center justify-between mt-auto">
                  <p className="relative z-10 text-white bg-white/30 text-center rounded-full mt-2 py-2 px-1 w-auto">
                    ${product.price}
                  </p>

                  <button
                    disabled={cooldownId === product.id}
                    onClick={() => {
                      addToCart(product);
                      triggerCartSuccess && triggerCartSuccess();
                      setCooldownId(product.id);
                      setTimeout(() => setCooldownId(null), 2000);
                    }}
                    className={`relative z-10 mt-2 mb-0.5 w-auto text-white text-xs md:text-sm px-1 md:px-9 py-2 border-1 border-orange-500 rounded-full transition-colors cursor-pointer
                      ${
                        cooldownId === product.id
                          ? "bg-gray-500 border-gray-500 w-full items-center  justify-center flex"
                          : "bg-orange-500 border-orange-500 hover:bg-orange-400 hover:border-orange-400"
                      }
                    `}
                  >
                    {cooldownId === product.id ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Lottie
                        animationData={cartAnimation}
                        loop={false}
                        className="scale-[2]"
                      />
                    </div>
                    ) : (
                      "Agregar al carrito"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}