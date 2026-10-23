const priceFormatter = new Intl.NumberFormat("es-AR");

export const formatPrice = (price) => `$${priceFormatter.format(price)}`;
