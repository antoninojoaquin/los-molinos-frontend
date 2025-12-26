function Ubicacion() {
  return (
    <section className="w-screen bg-gray-950 py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-orange-500 font-semibold tracking-wide">
            DÓNDE ESTAMOS
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-6">
            Dolores, Buenos Aires
          </h2>

          <p className="text-gray-400 text-lg max-w-md">
            Nuestro punto de encuentro con la cultura del asado.
            Pasá, conocenos y llevate lo que hace falta para prender el fuego.
          </p>

          <a
            href="https://www.google.com/maps/place/Arist%C3%B3bulo+del+Valle+178,+B7100+Dolores,+Provincia+de+Buenos+Aires/@-36.3166699,-57.6791062,15.5z/data=!4m6!3m5!1s0x95999e42c33ed273:0x59b33785e775e2f8!8m2!3d-36.3172659!4d-57.6767455!16s%2Fg%2F11rg691ghs?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
            className="!text-gray-900 inline-block mt-8 px-6 py-3 rounded-full bg-orange-500 font-semibold hover:bg-orange-400 transition-all duration-200"
          >
            Cómo llegar
          </a>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-orange-500 opacity-30 blur-xl" />
          
          <div className="relative w-full h-80 md:h-96 rounded-3xl overflow-hidden border border-gray-800">
            <iframe
              title="Mapa Dolores Buenos Aires"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5406.603341935121!2d-57.68058441618891!3d-36.317506178602855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95999e42c33ed273%3A0x59b33785e775e2f8!2sArist%C3%B3bulo%20del%20Valle%20178%2C%20B7100%20Dolores%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1766184914228!5m2!1ses!2sar"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default Ubicacion;
