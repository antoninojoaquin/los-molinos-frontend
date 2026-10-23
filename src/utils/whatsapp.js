const WHATSAPP_NUMBER = "542245502977";

export const getWhatsAppUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
