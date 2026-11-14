import { createElement } from "react";
import { FaEnvelope, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import Logo from "../assets/logofooter.webp";
import { WHATSAPP_NUMBER } from "../utils/whatsapp";

const CONTACT = [
  { icon: FaEnvelope, label: "lmregionales@gmail.com", href: "mailto:lmregionales@gmail.com" },
  { icon: FaPhoneAlt, label: "+54 9 2245 50-2977", href: "tel:+5492245502977" },
  {
    icon: FaMapMarkerAlt,
    label: "Aristóbulo del Valle 178, Dolores",
    href: "https://www.google.com/maps/search/?api=1&query=Arist%C3%B3bulo+del+Valle+178,+Dolores,+Buenos+Aires",
  },
];

const SOCIAL = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/lmregionales/" },
  { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/listo.elpollo.54" },
  { icon: FaWhatsapp, label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}` },
];

const FooterIcon = ({ icon, ...props }) => createElement(icon, props);

function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-300">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Los Molinos Regionales" width="160" height="160" loading="lazy" className="h-20 w-20" />
          <p className="text-stone-400 max-w-[14rem] leading-snug">Accesorios para la parrilla, en Dolores.</p>
        </div>

        {/* Mail, teléfono y dirección se pueden tocar: abren el mail, el teléfono o el mapa */}
        <ul className="flex flex-col gap-2 md:justify-self-center">
          {CONTACT.map(({ icon, label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-3 font-normal text-stone-300 hover:text-white"
              >
                <FooterIcon icon={icon} className="text-stone-500 shrink-0" />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          {SOCIAL.map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-600 transition-colors"
            >
              <FooterIcon icon={icon} />
            </a>
          ))}
        </div>
      </div>

      <p className="border-t border-stone-900 py-4 text-center text-xs text-stone-600">
        © {new Date().getFullYear()} Los Molinos Regionales
      </p>
    </footer>
  );
}

export default Footer;
