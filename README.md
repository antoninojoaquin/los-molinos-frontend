# Los Molinos Regionales — Tienda online

Código fuente de **[lmregionales.vercel.app](https://lmregionales.vercel.app)**, la tienda online de un negocio de accesorios para parrilla de Dolores, Buenos Aires. Digitaliza un catálogo tradicional con una experiencia de compra moderna, pensada sobre todo para celular.

Es una **SPA en React** con **Tailwind CSS**, que lee productos y stock desde **Firestore** y cierra cada venta con un **pedido armado automáticamente por WhatsApp**: el canal donde el negocio ya atiende a sus clientes.

![Catálogo de productos](docs/screenshots/catalogo.webp)

<p align="center">
  <img src="docs/screenshots/celular-catalogo.webp" alt="Catálogo en celular" width="260" />
  <img src="docs/screenshots/celular-detalle.webp" alt="Detalle de producto en celular" width="260" />
</p>

## ✨ Funcionalidades

**Catálogo y stock**
- Productos, precios y stock cargados desde Firestore; el negocio los actualiza sin tocar código.
- Etiquetas de stock bajo ("¡Quedan 2!") y de "Sin stock"; los productos agotados van al final.
- El carrito nunca permite superar el stock disponible y se re-sincroniza con Firestore al abrirlo (stock, precios y productos dados de baja).

**Detalle de producto**
- Cada producto tiene su propia URL (`/productos/:id`) que abre un detalle sobre el catálogo, sin perder la posición del scroll.
- Zoom que sigue al cursor en PC, y visor a pantalla completa con pellizco, doble toque y arrastre en celular.
- Botón para consultar por WhatsApp con el producto ya mencionado, y para compartirlo (menú nativo en celular, copia del link en PC).

**Compra**
- Carrito y favoritos persistidos en el navegador; el carrito muestra un contador en el header y se sincroniza entre pestañas.
- Checkout por WhatsApp: el mensaje se arma con el detalle del pedido y el total.
- Botón flotante de WhatsApp en todo el sitio, información de horarios, medios de pago y zona de entrega.

**Rendimiento y SEO**
- Rutas con carga diferida: la página de inicio no descarga Firebase ni las animaciones (bundle inicial ~80 KB gzip).
- Imágenes servidas por Cloudinary en WebP/AVIF, con tamaños responsive y carga diferida.
- Metadatos Open Graph para la vista previa al compartir y datos estructurados de negocio local (`schema.org/Store`) para búsquedas en Google.

## 🛠️ Stack

| | |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4 |
| Datos | Firebase Firestore |
| Imágenes | Cloudinary |
| Extras | lottie-react (animaciones), react-zoom-pan-pinch (zoom táctil), react-icons |
| Build y deploy | Vite, Vercel |

## 📁 Estructura

```
src/
├── components/   Header, footer, detalle de producto, visor de imágenes, botones reutilizables
├── context/      Estado global del carrito (CartProvider + useCart)
├── hooks/        useDocumentTitle
├── pages/        Productos/Favoritos, Carrito, Ubicación, 404
├── services/     Acceso a Firestore
└── utils/        Precios, stock, imágenes, WhatsApp y datos del negocio
```

## 🚀 Correr el proyecto

Requiere Node.js 24.

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run lint
```

La app usa el proyecto de Firestore del negocio. Para conectarla a uno propio, reemplazá la configuración en `src/firebase.js` y creá una colección `products` con documentos de esta forma:

```js
{
  name: "Set Asador con Estuche de Cuero",
  category: "Sets de Asador",
  price: 28500,          // número, en pesos
  stock: 2,              // número; si falta, no se limita la compra
  imageUrl: "https://res.cloudinary.com/...",
  description: "Utensilios de calidad para la parrilla..."
}
```

> La configuración de Firebase del frontend es pública por diseño: la base de datos está protegida por reglas de seguridad que solo permiten leer el catálogo.

---

Hecho por Antonino Joaquín — **[LinkedIn](https://www.linkedin.com/in/antoninojoaquin/)**.
