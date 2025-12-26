import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function ProductList() {
  const [products, setProducts] = useState([]);

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
    };

    fetchProducts();
  }, []);

return (
  <section className="w-full bg-gray-950 px-6 py-12">
    <h2 className="text-2xl font-semibold mb-6 py-6 text-orange-500">Productos</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-gray-800 p-4 rounded-lg shadow"
        >
          <p className="text-gray-100 font-medium">{product.name}</p>
          <p className="text-gray-100">${product.price}</p>
        </div>
      ))}
    </div>
  </section>
);
}
