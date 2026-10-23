import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Footer from "./components/footer.jsx";
import Hero from "./components/hero.jsx";
import Header from "./components/header.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import CartProvider from "./context/CartProvider.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

// El resto de las páginas se descarga al visitarlas: el inicio no carga Firebase ni Lottie
const About = lazy(() => import("./pages/About.jsx"));
const Ubication = lazy(() => import("./pages/Ubication.jsx"));
const ProductList = lazy(() => import("./pages/ProductList.jsx"));
const Favorites = lazy(() => import("./pages/Favorites.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="pt-24 min-h-screen flex flex-col justify-between overflow-x-hidden bg-gray-950">
          <Header />
          <main className="flex">
            <Suspense fallback={<div className="w-full min-h-[60vh] bg-gray-950" />}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/nosotros" element={<About />} />
                <Route path="/ubicacion" element={<Ubication />} />
                <Route path="/productos/:productId?" element={<ProductList />} />
                <Route path="/favoritos/:productId?" element={<Favorites />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
