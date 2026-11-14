import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import Footer from "./components/footer.jsx";
import Hero from "./components/hero.jsx";
import Header from "./components/header.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import CartProvider from "./context/CartProvider.jsx";
import FavoritesProvider from "./context/FavoritesProvider.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

// El resto de las páginas se descarga al visitarlas: el inicio no carga Lottie,
// y Firebase solo se descarga al entrar al panel
const Ubication = lazy(() => import("./pages/Ubication.jsx"));
const ProductList = lazy(() => import("./pages/ProductList.jsx"));
const Favorites = lazy(() => import("./pages/Favorites.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const AdminPage = lazy(() => import("./admin/AdminPage.jsx"));

function StoreLayout() {
  return (
    <div className="pt-24 min-h-screen flex flex-col justify-between overflow-x-hidden bg-stone-950">
      <Header />
      <main className="flex">
        <Suspense fallback={<div className="w-full min-h-dvh bg-stone-950" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* El panel va sin el header, el footer ni el botón de WhatsApp de la tienda */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
                <AdminPage />
              </Suspense>
            }
          />
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Hero />} />
            <Route path="/ubicacion" element={<Ubication />} />
            <Route path="/productos/:productId?" element={<ProductList />} />
            <Route path="/favoritos/:productId?" element={<Favorites />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;
