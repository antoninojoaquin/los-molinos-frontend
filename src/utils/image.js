// Pide a Cloudinary la imagen en formato moderno (webp/avif), comprimida y al ancho necesario
export const optimizeImage = (url, width) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const transforms = ["f_auto", "q_auto", width && `w_${width}`, width && "c_limit"]
    .filter(Boolean)
    .join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
};

// Fotos de un producto: `images` (la primera es la principal). Los productos viejos tienen una sola, en `imageUrl`.
export const getImages = (product) =>
  product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];

export const mainImage = (product) => getImages(product)[0];
