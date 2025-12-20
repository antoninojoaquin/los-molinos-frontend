import React, { useState } from 'react';


function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const encode = (data) => {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "contacto", ...formData })
    })
      .then(() => {
        setEnviado(true);
      })
      .catch((error) => alert("Hubo un error al enviar el mensaje. Por favor intenta de nuevo."));
  };

  return (
    <section className="w-screen bg-gray-950 py-24 px-6 md:px-12 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-orange-500 font-semibold tracking-wide uppercase">
            Hablemos
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3 mb-6">
            ¿Tenés alguna duda?
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Ya sea que busques un accesorio específico para tu parrilla, quieras consultar precios mayoristas o simplemente saludarnos. 
            Estamos para asesorarte en lo que necesites.
          </p>
        </div>
        

        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-orange-500 opacity-20 blur-xl" />
          
          <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl min-h-[480px] flex flex-col justify-center">
            
            {!enviado ? (
              <form 
                name="contacto" 
                method="POST" 
                data-netlify="true"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-6"
                netlify
              >
                <input type="hidden" name="form-name" value="contacto" />
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-2">
                    Nombre completo
                  </label>
                  <input 
                    type="text" 
                    id="nombre"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ingresá tu nombre..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                    Email de contacto
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingresá tu correo..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-400 mb-2">
                    Tu mensaje
                  </label>
                  <textarea 
                    id="mensaje"
                    name="mensaje"
                    required
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ingresá el mensaje que nos quieres dejar..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-400 text-gray-900 font-bold py-4 rounded-full transition-all duration-200 mt-2 shadow-lg hover:shadow-orange-500/25"
                >
                  Enviar Mensaje
                </button>
              </form>
            ) : (
              <div className="text-center py-10 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">¡Mensaje Enviado!</h3>
                <p className="text-gray-400 text-lg">
                  Gracias por escribirnos. Nos pondremos en contacto con vos a la brevedad.
                </p>
                <button 
                  onClick={() => { setEnviado(false); setFormData({ nombre:'', email:'', mensaje:'' }) }}
                  className="mt-8 text-orange-500 font-semibold hover:text-orange-400 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}

export default Contacto;