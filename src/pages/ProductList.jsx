import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

export default function ProductList() {
  const [products, setProducts] = useState([]);
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
        console.log("Productos:", data);
      } catch (error) {
        console.error("Error al traer productos:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

if (loading) {
  return (
    <div className="flex bg-gray-950 justify-center items-center h-128 w-full">
      <Lottie animationData={loadingAnimation} loop className="w-64 h-64" />
    </div>
  );
}

return (
  <section className="w-full bg-gray-950 px-6 md:px-16 mt-8 py-12">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-gray-800 p-1 rounded-lg shadow flex flex-col h-full"
        >
          <img className="object-cover h-64 w-full" src={product.imageUrl} alt={product.name}/>
          <p className="text-gray-500 mt-0.5 mb-4 text-sm">{product.category}</p>
          <p className="text-gray-300 font-medium px-1">{product.name}</p>
          <p className="text-gray-50 font-extrabold px-1">${product.price}</p>
          <div className="flex justify-center mt-auto">
            <button className="mt-2 mb-0.5 px-16 py-2 border-1 rounded-full border-orange-500 bg-orange-500 text-white font-semibold hover:bg-orange-400 hover:border-orange-400 transition-colors hover:cursor-pointer">Agregar al Carrito</button>
          </div>       
        </div>
      ))}
    </div>
  </section>
);
}
