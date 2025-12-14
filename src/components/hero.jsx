import HeroImage from "../assets/heroexample-2.jpg"; // Reemplazá con tu imagen principal

function Hero() {
  return (
    <section className="relative w-screen h-screen flex items-center justify-center bg-gray-100">
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
        <a href="/productos" className="cursor-pointer">
          <button className="cursor-pointer text-2xl mt-6 px-2 py-1 border-2 bg-orange-500 border-orange-500 text-white font-medium rounded-lg hover:text-white hover:bg-orange-400 hover:border-orange-400 transition-all duration-500">
              Explorar Productos
          </button>
        </a>
      </div>
    </section>
  );
}

export default Hero;
