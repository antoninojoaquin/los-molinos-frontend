import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Nosotros from "./pages/Nosotros.jsx";

function App() {
  return (
    <Router>
      <div className="pt-28 min-h-screen flex flex-col justify-between overflow-x-hidden bg-gray-100">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/nosotros" element={<Nosotros />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
