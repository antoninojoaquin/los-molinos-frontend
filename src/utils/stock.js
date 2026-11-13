// El stock se maneja como disponible / sin stock con el campo booleano `inStock` de Firestore.
// Si falta, se usa el campo numérico viejo `stock` (> 0 = disponible); si no hay ninguno, está disponible.
export const isInStock = (product) =>
  product.inStock ?? (product.stock == null || product.stock > 0);
