import HeroImage from "../assets/hero-image.jpg"; // Reemplazá con tu imagen principal

function Hero() {
  return (
    <section className="relative w-screen h-screen flex items-center justify-center bg-gray-100">
      {/* Imagen de fondo */}
      <img
        src={HeroImage}
        alt="Hero Los Molinos"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />

      {/* Contenido */}
      <div className="relative z-10 text-center px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
          Bienvenido a Los Molinos Regionales
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-white drop-shadow-md">
          Venta de accesorios para tu parrilla en Dolores y la zona
        </p>
        <button className="mt-6 px-6 py-2 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-orange-500 transition-colors duration-200">
            Explorar Productos
        </button>
      </div>
    </section>
  );
}

export default Hero;
