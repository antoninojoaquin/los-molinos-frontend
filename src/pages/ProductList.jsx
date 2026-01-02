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
  <section className="w-full bg-gray-950 px-6 py-12">
    <h2 className="text-2xl font-semibold mb-6 py-6 text-orange-500">Productos</h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-gray-800 p-1 rounded-lg shadow"
        >
          <img className="object-cover h-64 w-full" src={product.imageUrl} alt={product.name}/>
          <p className="text-gray-100 font-medium">{product.name}</p>
          <p className="text-gray-100">${product.price}</p>
        </div>
      ))}
    </div>
  </section>
);
}
