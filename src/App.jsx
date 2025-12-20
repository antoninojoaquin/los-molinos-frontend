import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import Hero from "./components/hero.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Ubicacion from "./pages/Ubicacion.jsx";
import Contacto from "./pages/Contacto.jsx";
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
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/contacto" element={<Contacto />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
