import { AbsoluteFill, Img, staticFile } from "remotion";
import { prog, resorte, useT } from "../anim";
import { spec } from "../spec";
import { alfa, marca, theme } from "../theme";
import { Background } from "./Background";

/** Cierre: un círculo se abre y revela el logo (o el nombre de marca) con anillos y el lema. */
export const Cierre: React.FC = () => {
  const c = spec.closing;
  const t = useT();
  if (!c || t < c.at - 0.05) {
    return null;
  }
  const u = t - c.at;
  const abre = prog(u, 0, 0.7);
  const e = resorte(u, 0.25, 85, 12);
  const cy = 900;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${abre * 1700}px at 540px ${cy}px)` }}>
      <Background fase={40} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((k) => {
          const dt = u - 0.4 - k * 0.55;
          const ph = (((dt / 2.0) % 1) + 1) % 1;
          return dt > 0 ? <circle key={k} cx={540} cy={cy} r={220 + ph * 640} fill="none" stroke={theme.accent} strokeWidth={4 - ph * 2.6} opacity={(1 - ph) * 0.55} /> : null;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 160, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - e) * 120}px) scale(${0.85 + 0.15 * e})`, opacity: Math.min(1, e * 1.5) }}>
        {marca.logo ? (
          <Img src={staticFile(marca.logo)} style={{ width: 760, maxHeight: 420, objectFit: "contain" }} />
        ) : (
          <div style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, fontSize: 150, letterSpacing: theme.displayTracking, color: theme.ink, textShadow: `0 0 60px ${alfa(theme.accent, 0.5)}`, textAlign: "center", lineHeight: 1 }}>{marca.name}</div>
        )}
        <div style={{ marginTop: 40, fontFamily: theme.fontBody, fontWeight: 700, fontSize: 40, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.inkSoft, opacity: prog(u, 0.8, 1.3) }}>{c.tagline ?? marca.tagline}</div>
        <div style={{ marginTop: 18, fontFamily: theme.fontBody, fontWeight: 800, fontSize: 40, color: theme.accent, opacity: prog(u, 1.0, 1.5) }}>{marca.handle}</div>
      </div>
    </AbsoluteFill>
  );
};
