import HeroImage from "../assets/heroexample-2.webp";

function Hero() {
  return (
    <section className="relative w-screen h-screen flex items-center justify-center">
      <img
        src={HeroImage}
        alt="Hero Los Molinos"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />

      <div className="relative z-10 text-center px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
          Bienvenido a Los Molinos Regionales
        </h1>
        <p className="mt-4 text-lg md:text-2xl text-white drop-shadow-md">
          Venta de accesorios para tu parrilla en Dolores y la zona
        </p>
        <a href="/productos" className="cursor-pointer">
          <button className="cursor-pointer text-2xl mt-6 px-10 py-2 border-2 shadow-[0_0_20px_rgba(0,0,0,1)] bg-orange-500 border-orange-500 text-white font-medium rounded-full hover:text-white hover:bg-orange-400 hover:border-orange-400 transition-all duration-500">
              Explorar Productos
          </button>
        </a>
      </div>
    </section>
  );
}

export default Hero;
