// Pide a Cloudinary la imagen en formato moderno (webp/avif), comprimida y al ancho necesario
export const optimizeImage = (url, width) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const transforms = ["f_auto", "q_auto", width && `w_${width}`, width && "c_limit"]
    .filter(Boolean)
    .join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
};
