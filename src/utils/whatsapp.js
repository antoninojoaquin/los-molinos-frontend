// Formato internacional de celular argentino: 54 + 9 + código de área sin 0 + número
export const WHATSAPP_NUMBER = "5492245502977";

export const getWhatsAppUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
