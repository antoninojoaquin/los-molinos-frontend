function Nosotros() {
  return (
    <section className="w-screen bg-gray-950 py-20 px-6 md:px-12 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl mt-6 md:text-4xl font-extrabold text-orange-500 mb-6">
            Somos Los Molinos Regionales
          </h2>

          <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-4">
            Nacimos con una idea clara: llevar a cada asado productos de calidad,
            funcionales y pensados para quienes disfrutan de la parrilla como un ritual.
          </p>

          <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-4">
            Desde Dolores y para toda la zona, trabajamos con accesorios seleccionados,
            durables y con diseño, combinando tradición y modernidad en cada detalle.
          </p>

          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            Creemos que un buen asado empieza mucho antes del fuego: empieza con las
            herramientas correctas.
          </p>
        </div>

        <div className="mt-10 bg-gray-100 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.6)] p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            ¿Qué nos define?
          </h3>

          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500">●</span><span>Pasión por la parrilla y la cultura del asado.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500">●</span><span>Accesorios pensados para durar y rendir.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500">●</span><span>Cercanía, atención personalizada y compromiso local.</span>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}

export default Nosotros;
