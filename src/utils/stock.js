// Si un producto no tiene el campo stock en Firestore, no se limita la compra
export const getStock = (product) => product.stock ?? Infinity;
