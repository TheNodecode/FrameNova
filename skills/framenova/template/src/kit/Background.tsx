import { AbsoluteFill } from "remotion";
import { useT } from "../anim";
import type { FondoTipo } from "../theme";
import { alfa, theme } from "../theme";

/**
 * Fondos animados de tema. `studio` (blanco/rubor con luz y bokeh), `aurora` (blobs de color que derivan, IA/futurista),
 * `grid` (rejilla en perspectiva con horizonte brillante, tech/automatización) y `mesh` (degradados lentos, lujo/creador).
 */
export const Background: React.FC<{ tipo?: FondoTipo; fase?: number }> = ({ tipo, fase = 0 }) => {
  const t = useT() + fase;
  const k = tipo ?? theme.fondo;
  const { accent, accent2, bg, bg2, dark } = theme;
  const base = `linear-gradient(176deg, ${bg} 0%, ${bg2} 100%)`;

  if (k === "aurora") {
    return (
      <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
        {[
          { c: accent, x: 20, y: 24, r: 900, s: 0.31 },
          { c: accent2, x: 78, y: 62, r: 820, s: 0.23 },
          { c: accent, x: 40, y: 92, r: 700, s: 0.37 },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${b.x + 10 * Math.sin(t * b.s + i)}%`,
              top: `${b.y + 6 * Math.cos(t * b.s * 1.3 + i)}%`,
              width: b.r,
              height: b.r,
              marginLeft: -b.r / 2,
              marginTop: -b.r / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alfa(b.c, 0.5)}, transparent 66%)`,
              filter: "blur(30px)",
            }}
          />
        ))}
        <Partículas t={t} />
      </AbsoluteFill>
    );
  }

  if (k === "grid") {
    const desp = (t * 60) % 120;
    return (
      <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "42%", width: 2400, height: 2400, marginLeft: -1200, transformOrigin: "50% 0%", transform: "perspective(900px) rotateX(72deg)" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(${alfa(accent, 0.55)} 2px, transparent 2px), linear-gradient(90deg, ${alfa(accent, 0.55)} 2px, transparent 2px)`,
              backgroundSize: "120px 120px",
              backgroundPosition: `0 ${desp}px`,
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 80%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 80%)",
            }}
          />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: "42%", height: 340, marginTop: -170, background: `radial-gradient(60% 50% at 50% 50%, ${alfa(accent2, 0.38)}, transparent 72%)` }} />
        <div style={{ position: "absolute", left: "50%", top: "16%", width: 900, height: 900, marginLeft: -450, borderRadius: "50%", background: `radial-gradient(circle, ${alfa(accent, 0.3)}, transparent 68%)`, filter: "blur(20px)" }} />
        <Partículas t={t} />
      </AbsoluteFill>
    );
  }

  if (k === "mesh") {
    return (
      <AbsoluteFill style={{ background: base }}>
        <AbsoluteFill style={{ background: `radial-gradient(48% 30% at ${30 + 12 * Math.sin(t * 0.3)}% ${22 + 6 * Math.cos(t * 0.4)}%, ${alfa(accent, 0.34)}, transparent 100%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(52% 34% at ${72 + 8 * Math.cos(t * 0.35)}% ${66 + 7 * Math.sin(t * 0.3)}%, ${alfa(accent2, 0.26)}, transparent 100%)` }} />
        <Partículas t={t} />
      </AbsoluteFill>
    );
  }

  // studio
  return (
    <AbsoluteFill style={{ background: base }}>
      <AbsoluteFill style={{ background: `radial-gradient(48% 26% at ${50 + 9 * Math.sin(t * 0.6)}% ${30 + 3 * Math.cos(t * 0.5)}%, ${dark ? alfa(accent, 0.3) : "rgba(255,255,255,0.95)"} 0%, transparent 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 18% at 50% 78%, ${alfa(accent, dark ? 0.2 : 0.14)} 0%, transparent 100%)` }} />
      <Partículas t={t} />
    </AbsoluteFill>
  );
};

/** Motas de luz que suben despacio (profundidad sin distraer). */
const Partículas: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 12 }, (_, i) => {
      const r = (k: number) => {
        const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
        return x - Math.floor(x);
      };
      const tam = 8 + r(1) * 38;
      const y = 2000 - ((t * (16 + r(2) * 30) + r(3) * 2100) % 2200);
      const x = r(4) * 1080 + Math.sin(t * (0.4 + r(5)) + i) * 24;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: tam, height: tam, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${alfa(theme.accent, 0.25)} 70%)`, opacity: 0.12 + 0.3 * r(6), filter: tam > 28 ? "blur(3px)" : "none" }} />;
    })}
  </AbsoluteFill>
);
