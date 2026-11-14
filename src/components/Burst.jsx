import { useMemo } from "react";
import { FaHeart } from "react-icons/fa";

// Estallido de festejo al agregar a favoritos (corazoncitos) o al carrito (chispas de parrilla).
// Uso: const [burst, fire] = useBurst() (hooks/useBurst.js);  <Burst kind="hearts" burstKey={burst} />  y fire() al agregar.
// Con "reducir movimiento" activado en el dispositivo no se muestra (ver .animate-burst en index.css).

const KINDS = {
  hearts: { count: 9, distance: [26, 42], colors: ["#f43f5e", "#fb7185", "#f97316", "#fda4af"], rise: 6, stretch: 1 },
  // Las chispas vuelan más hacia los costados (los botones del carrito son anchos) y suben
  sparks: { count: 16, distance: [30, 58], colors: ["#f97316", "#fb923c", "#fbbf24", "#fdba74"], rise: 18, stretch: 1.6 },
};

export default function Burst({ kind = "sparks", burstKey }) {
  const config = KINDS[kind];

  // Dirección, distancia, tamaño y color de cada partícula: cambian en cada estallido
  const particles = useMemo(() => {
    if (!burstKey) return [];
    const [min, max] = config.distance;
    return Array.from({ length: config.count }, (_, i) => {
      const angle = (i / config.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const distance = min + Math.random() * (max - min);
      return {
        dx: Math.cos(angle) * distance * config.stretch,
        // Las chispas suben un poco más (como las de la parrilla)
        dy: Math.sin(angle) * distance - config.rise,
        size: kind === "hearts" ? 7 + Math.random() * 5 : 4 + Math.random() * 4,
        color: config.colors[i % config.colors.length],
        delay: Math.random() * 60,
      };
    });
  }, [burstKey, config, kind]);

  if (!particles.length) return null;

  return (
    <span key={burstKey} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-burst absolute left-1/2 top-1/2"
          style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDelay: `${p.delay}ms`, color: p.color }}
        >
          {kind === "hearts" ? (
            <FaHeart style={{ width: p.size, height: p.size }} />
          ) : (
            <span className="block rounded-full" style={{ width: p.size, height: p.size, background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
          )}
        </span>
      ))}
    </span>
  );
}
