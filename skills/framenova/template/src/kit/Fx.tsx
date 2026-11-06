import { AbsoluteFill } from "remotion";
import { prog, resorte, useT } from "../anim";
import { spec, type ColorRef, type Layer } from "../spec";
import { alfa, theme } from "../theme";

export const color = (c?: ColorRef) => (c ? theme[c] : theme.accent);
/** Trazo de los efectos de luz: blanco sobre oscuro o sobre vídeo; con tema claro y sin vídeo, el acento. */
const luz = () => (theme.dark || spec.video ? "rgba(255,255,255,0.95)" : alfa(theme.accent, 0.75));

/** Palabra gigante a contorno con resplandor que deriva detrás de la persona. */
export const GiantWord: React.FC<{ l: Extract<Layer, { type: "giantWord" }> }> = ({ l }) => {
  const t = useT();
  if (t < l.from - 0.1 || t > l.to + 0.5) {
    return null;
  }
  const dir = l.dir ?? 1;
  const e = resorte(t, l.from, 90, 16);
  const sale = prog(t, l.to, l.to + 0.4);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: l.y ?? 800,
          textAlign: "center",
          fontFamily: theme.fontDisplay,
          fontWeight: theme.displayWeight,
          fontSize: l.size ?? 220,
          lineHeight: 1,
          letterSpacing: theme.displayTracking,
          whiteSpace: "nowrap",
          color: "transparent",
          WebkitTextStroke: `3px ${theme.dark ? "rgba(255,255,255,0.75)" : alfa(theme.ink, 0.5)}`,
          transform: `translateX(${(t - l.from) * 34 * dir + (1 - e) * 380 * dir}px) rotate(${-4 * dir}deg)`,
          opacity: Math.min(1, e * 1.6) * (1 - sale) * 0.85,
          filter: `drop-shadow(0 0 22px ${alfa(color(l.color), 0.7)})`,
        }}
      >
        {l.text}
      </div>
    </AbsoluteFill>
  );
};

/** Gancho: palabra o número gigante a contorno que entra al instante, brilla y se va rápido (≤ ~1,5 s). Con rayos de luz. */
export const Hook: React.FC<{ l: Extract<Layer, { type: "hook" }> }> = ({ l }) => {
  const t = useT();
  if (t < l.from - 0.05 || t > l.to + 0.2) {
    return null;
  }
  const e = resorte(t, l.from, 120, 14);
  const sale = prog(t, l.to - 0.5, l.to);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: l.y ?? 330,
          textAlign: "center",
          fontFamily: theme.fontDisplay,
          fontWeight: theme.displayWeight,
          fontSize: l.size ?? 1250,
          lineHeight: 1,
          color: theme.dark || spec.video ? alfa("#FFFFFF", 0.14) : alfa(theme.accent, 0.1),
          WebkitTextStroke: `6px ${luz()}`,
          transform: `translateX(${(1 - e) * -600}px) rotate(${-5 + Math.sin(t * 0.9) * 2}deg) scale(${1 + 0.1 * e + 0.25 * sale})`,
          opacity: (1 - sale) * Math.min(1, e * 1.6),
          filter: `drop-shadow(0 0 36px ${alfa(theme.accent2, 1)})`,
        }}
      >
        {l.text}
      </div>
      {[0, 1, 2].map((k) => {
        const u = prog(t, l.from + 0.05 + k * 0.28, l.from + 1.5 + k * 0.28);
        return <div key={k} style={{ position: "absolute", top: -100, left: -300 + u * 1700, width: 90 - k * 20, height: 2100, transform: "rotate(18deg)", background: `linear-gradient(90deg, transparent, ${luz()}, transparent)`, opacity: u > 0 && u < 1 ? 0.55 : 0, filter: "blur(6px)" }} />;
      })}
    </AbsoluteFill>
  );
};

/** Estallido de luz: 3 anillos que se expanden + 3 rayos que barren. Ideal para "la caída" de la música. */
export const Burst: React.FC<{ at: number }> = ({ at }) => {
  const t = useT();
  const u = t - at;
  if (u < -0.05 || u > 2.2) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {[0, 1, 2].map((k) => {
        const q = Math.min(1, Math.max(0, (u - k * 0.18) / 1.3));
        if (q <= 0 || q >= 1) {
          return null;
        }
        const r = 120 + q * 900;
        return <div key={k} style={{ position: "absolute", left: 540 - r, top: 900 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${7 - q * 6}px solid ${luz()}`, boxShadow: `0 0 40px ${alfa(theme.accent2, 0.9)}`, opacity: (1 - q) * 0.9 }} />;
      })}
      {[0, 1, 2].map((k) => {
        const q = prog(u, k * 0.22, 1.4 + k * 0.22);
        return <div key={k} style={{ position: "absolute", top: -100, left: -300 + q * 1700, width: 100 - k * 24, height: 2100, transform: "rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))", opacity: q > 0 && q < 1 ? 0.85 : 0, filter: "blur(6px)" }} />;
      })}
    </AbsoluteFill>
  );
};

/** Etiqueta de cristal con punto de color (para señalar algo puntual). */
export const Chip: React.FC<{ l: Extract<Layer, { type: "chip" }> }> = ({ l }) => {
  const t = useT();
  if (t < l.from - 0.05 || t > l.to + 0.3) {
    return null;
  }
  const e = resorte(t, l.from, 170, 13);
  const sale = prog(t, l.to, l.to + 0.25);
  const c = color(l.color);
  return (
    <div
      style={{
        position: "absolute",
        left: l.x ?? 540,
        top: l.y,
        transform: `translate(-50%, -50%) translateY(${(1 - e) * 30}px) scale(${0.7 + 0.3 * e - sale * 0.2})`,
        opacity: Math.min(1, e * 1.6) * (1 - sale),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 28px",
        borderRadius: 999,
        background: theme.glass,
        border: `1.5px solid ${theme.glassBorder}`,
        boxShadow: `${theme.shadow}, 0 0 28px ${alfa(c, 0.4)}`,
        backdropFilter: "blur(14px)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: c, boxShadow: `0 0 16px ${c}` }} />
      <span style={{ fontFamily: theme.fontBody, fontWeight: 800, fontSize: 30, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.ink }}>{l.text}</span>
    </div>
  );
};

/** Tarjeta de cifra: número que cuenta hasta su valor. */
export const StatLayer: React.FC<{ l: Extract<Layer, { type: "stat" }> }> = ({ l }) => {
  const t = useT();
  if (t < l.from - 0.05 || t > l.to + 0.3) {
    return null;
  }
  const e = resorte(t, l.from, 160, 13);
  const sale = prog(t, l.to, l.to + 0.25);
  const v = l.value * prog(t, l.from + 0.1, l.from + 1.3);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: l.y ?? 262, height: 250, borderRadius: theme.radius, background: theme.glass, border: `1.5px solid ${theme.glassBorder}`, boxShadow: theme.shadow, backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - e) * -70}px) scale(${0.85 + 0.15 * e - sale * 0.1})`, opacity: Math.min(1, e * 1.7) * (1 - sale) }}>
      <div style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, fontSize: 130, lineHeight: 1, letterSpacing: theme.displayTracking, color: theme.accent, textShadow: `0 0 40px ${alfa(theme.accent, 0.5)}` }}>
        {l.prefix ?? ""}
        {v.toFixed(l.decimals ?? 0)}
        {l.suffix ?? ""}
      </div>
      <div style={{ marginTop: 6, fontFamily: theme.fontBody, fontWeight: 700, fontSize: 26, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.inkSoft }}>{l.label}</div>
    </div>
  );
};
