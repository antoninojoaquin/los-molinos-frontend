import { FaClock, FaWhatsapp, FaMoneyBillWave, FaMapMarkerAlt } from "react-icons/fa";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { BUSINESS_HOURS } from "../utils/business";

const PURCHASE_STEPS = [
  {
    icon: FaWhatsapp,
    title: "Hacé tu pedido",
    text: "Armá tu carrito en la web y envianos el pedido por WhatsApp. Te confirmamos disponibilidad al toque.",
  },
  {
    icon: FaMoneyBillWave,
    title: "Pagá como te quede cómodo",
    text: "Transferencia si coordinamos por WhatsApp, o efectivo si retirás en el local.",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Retirá o recibí",
    text: "Pasá por el local en nuestro horario o coordinamos la entrega. Por ahora, entregas solo en Dolores.",
  },
];

function Ubicacion() {
  useDocumentTitle("Ubicación");

  return (
    <section className="w-full bg-gray-950 py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-orange-500 font-semibold tracking-wide">
            DÓNDE ESTAMOS
          </h2>

          <h2 className="text-4xl md:text-4xl text-white mt-3 mb-6">
            Dolores, Buenos Aires
          </h2>

          <p className="text-gray-400 text-lg max-w-md">
            Nuestro punto de encuentro con la cultura del asado.
            Pasá, conocenos y llevate lo que hace falta para prender el fuego.
          </p>

          <div className="mt-8 flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 max-w-md">
            <FaClock className="text-orange-500 text-2xl mt-1 shrink-0" />
            <div>
              <p className="text-white font-semibold mb-2">Horario de atención</p>
              <dl className="space-y-2">
                {BUSINESS_HOURS.map(({ days, ranges }) => (
                  <div key={days}>
                    <dt className="text-gray-300 text-sm">{days}</dt>
                    <dd className="text-gray-400">{ranges.join(" y ")} hs</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl"/>
          
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

      <div className="max-w-6xl mx-auto mt-24">
        <h2 className="text-orange-500 font-semibold tracking-wide">
          CÓMO COMPRAR
        </h2>
        <h2 className="text-3xl md:text-4xl text-white mt-3 mb-10">
          Simple y sin vueltas
        </h2>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PURCHASE_STEPS.map((step, index) => (
            <li key={step.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/15 text-orange-500 text-lg">
                  <step.icon />
                </span>
                <span className="text-gray-500 font-semibold">Paso {index + 1}</span>
              </div>
              <p className="text-white font-semibold text-lg mb-2">{step.title}</p>
              <p className="text-gray-400 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Ubicacion;
