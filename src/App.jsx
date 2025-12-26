import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import Hero from "./components/hero.jsx";
import About from "./pages/About.jsx";
import Ubication from "./pages/Ubication.jsx";
import Contact from "./pages/Contact.jsx";
import ProductList from "./pages/ProductList.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="pt-28 min-h-screen flex flex-col justify-between overflow-x-hidden bg-gray-100">
        <Header />
        <main className="flex">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/ubicacion" element={<Ubication />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/productos" element={<ProductList />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
