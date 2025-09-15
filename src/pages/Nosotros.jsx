import React from "react";
import { motion } from "framer-motion";
import Logo from "../assets/logofooter.png";

export default function Nosotros() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-100 text-gray-900 px-6 py-12">
      {/* Hero */}
      <section className="max-w-6xl mx-auto mb-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
              Somos Los Molinos Regionales -
            </h1>
            <h1 className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
              Tradición y calidad en cada producto.
            </h1>
          </div>

          <motion.div
            className="hidden md:block rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={Logo} alt="logo-lm" className="w-full h-128 object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Misión / Valores */}
      <section id="mision" className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-4">Nuestra misión</h2>
        <p className="text-gray-700 mb-6">
          Brindar productos de primera calidad para parrilla, fomentando la tradición y el disfrute del asado en cada hogar, con un servicio cercano y confiable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ValueCard title="Calidad" desc="Seleccionamos cuidadosamente cada producto." />
          <ValueCard title="Tradición" desc="Respetamos la cultura del asado regional, combinando lo clásico con lo moderno." />
          <ValueCard title="Servicio" desc="Atención personalizada para que cada cliente viva la mejor experiencia." />
        </div>
      </section>
    </main>
  );
}

function ValueCard({ title, desc }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
