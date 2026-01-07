import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Lottie from "lottie-react";
import { FaHeart } from "react-icons/fa";
import loadingAnimation from "../assets/loading.json";

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const data = querySnapshot.docs.map(doc => ({
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
      JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  const favoriteProducts = products.filter(product =>
    favorites.includes(product.id)
  );

    if (loading) {
    return (
      <div className="flex bg-gray-950 justify-center items-center h-128 w-full">
        <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
      </div>
    );
  }

  return (
    <section className="w-full h-auto bg-gray-950 px-6 md:px-16 md:mt-8 py-12 flex items-center justify-center min-h-screen">
      {favoriteProducts.length === 0 ? (
        <p className="text-center text-orange-500 text-xl font-semibold">
          No hay productos en favoritos
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {favoriteProducts.map(product => (
            <div
              key={product.id}
              className="relative bg-gray-800 p-1 rounded-lg shadow flex flex-col h-full"
            >
              <img
                className="object-cover h-64 w-full"
                src={product.imageUrl}
                alt={product.name}
              />

              <FaHeart
                onClick={() => {
                  const updatedFavorites = favorites.filter(
                    id => id !== product.id
                  );
                  setFavorites(updatedFavorites);
                  localStorage.setItem(
                    "favorites",
                    JSON.stringify(updatedFavorites)
                  );
                }}
                className="absolute top-2 left-2 text-3xl text-orange-500 cursor-pointer hover:text-orange-400 transition-colors duration-200"
              />

              <p className="text-gray-500 mt-0.5 mb-4 text-sm">
                {product.category}
              </p>

              <p className="text-gray-300 font-medium px-1">{product.name}</p>

              <div className="gap-2 flex items-center justify-between mt-auto">
                <p className="text-gray-50 border-1 text-center rounded-full font-extrabold mt-2 py-1.5 md:py-2 px-1 w-auto shadow-sm shadow-white">
                  ${product.price}
                </p>

                <button className="mt-2 mb-0.5 w-full text-xs md:text-base px-1 md:px-9 py-1 md:py-2 border-1 rounded-full border-orange-500 bg-orange-500 text-white font-semibold hover:bg-orange-400 hover:border-orange-400 transition-colors hover:cursor-pointer">
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
