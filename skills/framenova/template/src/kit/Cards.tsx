import { Img, staticFile } from "remotion";
import { lin, prog, resorte, useT } from "../anim";
import type { CardItem, Layer } from "../spec";
import { alfa, theme } from "../theme";
import { color } from "./Fx";

/**
 * Tablero de tarjetas de cristal (ranking, pasos, features, herramientas). Cada tarjeta se revela en `at`; la última
 * revelada se ensancha (activa) y las demás se compactan. Con `image` el producto sale por arriba de la tarjeta.
 */
export const CardBoard: React.FC<{ l: Extract<Layer, { type: "cards" }> }> = ({ l }) => {
  const t = useT();
  if (t < l.from - 0.05 || t > l.to + 0.3) {
    return null;
  }
  const items = l.items;
  const total = 900;
  const gap = 16;
  const n = items.length;
  let activa = -1;
  items.forEach((it, i) => {
    if (t >= it.at) {
      activa = i;
    }
  });
  const tAct = activa >= 0 ? items[activa].at : l.from;
  const wC = Math.max(150, (total - gap * (n - 1)) / (n + 1.6));
  const wA = total - gap * (n - 1) - wC * (n - 1);
  const k = prog(t, tAct, tAct + 0.5);
  const prevAct = Math.max(-1, activa - 1);
  const anchos = items.map((_, i) => {
    const before = i === prevAct ? wA : wC; // la anterior pasa de activa a compacta
    const now = i === activa ? wA : wC;
    const from = activa <= 0 && i === 0 ? (n * 0 + (total - gap * (n - 1)) / n) : before;
    return activa < 0 ? (total - gap * (n - 1)) / n : from + (now - from) * k;
  });
  const sale = prog(t, l.to, l.to + 0.3);
  let x = 0;
  return (
    <div style={{ position: "absolute", left: 90, top: l.y ?? 250, width: total, height: 250, opacity: 1 - sale, transform: `translateY(${-sale * 30 + Math.sin(t * 1.2) * 3}px)` }}>
      {items.map((it, i) => {
        const w = anchos[i];
        const xi = x;
        x += w + gap;
        return <Tarjeta key={i} it={it} x={xi} w={w} activa={activa === i} i={i} from={l.from} />;
      })}
    </div>
  );
};

const Tarjeta: React.FC<{ it: CardItem; x: number; w: number; activa: boolean; i: number; from: number }> = ({ it, x, w, activa, i, from }) => {
  const t = useT();
  const e = resorte(t, from + i * 0.12, 190, 13);
  const rev = resorte(t, it.at, 150, 9);
  const revelada = t >= it.at;
  const c = color(it.tagColor);
  const compacta = w < 300;
  const brilla = ((t * 0.45 + x / 900) % 1.6) - 0.3;
  const fondo = theme.dark ? "linear-gradient(160deg, rgba(48,30,60,0.88), rgba(18,12,26,0.84))" : theme.glass;
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w, height: 250, transform: `translateY(${(1 - e) * -80}px) scale(${0.8 + 0.2 * e})`, opacity: Math.min(1, e * 1.7) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: theme.radius, overflow: "hidden", background: fondo, backdropFilter: "blur(14px)", border: `1.5px solid ${activa ? alfa(c, 0.8) : theme.glassBorder}`, boxShadow: `${theme.shadow}${activa ? `, 0 0 44px ${alfa(c, 0.33)}` : ""}` }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: `linear-gradient(90deg, transparent, ${c}, transparent)`, opacity: revelada ? 1 : 0.25 }} />
        <div style={{ position: "absolute", top: -40, bottom: -40, left: `${brilla * 100}%`, width: 70, transform: "rotate(14deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))" }} />
        {revelada && <div style={{ position: "absolute", left: compacta ? "50%" : 100, top: compacta ? 70 : 118, width: 220, height: 220, marginLeft: -110, marginTop: -110, borderRadius: "50%", background: `radial-gradient(circle, ${alfa(c, 0.33)}, transparent 68%)`, opacity: rev }} />}
      </div>
      {/* número a contorno */}
      <div style={{ position: "absolute", left: compacta ? 0 : 214, right: compacta ? 0 : "auto", top: compacta ? (it.image && revelada ? 6 : 26) : 14, textAlign: compacta ? "center" : "left", fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: compacta ? (it.image && revelada ? 40 : 110) : 44, lineHeight: 1, color: "transparent", WebkitTextStroke: `1.5px ${alfa(theme.ink, revelada ? 0.4 : 0.65)}` }}>{it.n ?? String(i + 1).padStart(2, "0")}</div>
      {it.image && revelada && (
        <div style={{ position: "absolute", left: compacta ? "50%" : 30, top: compacta ? 44 : -34, width: compacta ? 100 : 160, height: compacta ? 110 : 200, marginLeft: compacta ? -50 : 0, transform: `translateY(${(1 - rev) * 40}px) scale(${0.4 + 0.6 * rev}) rotate(${(1 - rev) * -18}deg)`, opacity: Math.min(1, rev * 1.6), filter: `drop-shadow(0 0 18px ${alfa(c, 0.55)})` }}>
          <Img src={staticFile(it.image)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      )}
      {it.tag && t >= it.at - 0.02 && (
        <div style={{ position: "absolute", ...(compacta ? { left: 0, right: 0, bottom: 20, textAlign: "center" } : { left: 214, top: 62 }) }}>
          <div style={{ display: "inline-block", padding: compacta ? "9px 16px" : "10px 22px", borderRadius: 999, fontFamily: theme.fontBody, fontWeight: 800, fontSize: compacta ? 20 : 25, letterSpacing: "0.08em", whiteSpace: "nowrap", color: "#0F0A10", background: `linear-gradient(160deg, ${c}, ${alfa(c, 0.87)})`, boxShadow: `0 0 26px ${alfa(c, 0.66)}, 0 8px 20px ${alfa(c, 0.33)}, inset 0 2px 0 rgba(255,255,255,0.6)`, transform: `scale(${0.5 + 0.5 * rev})`, opacity: Math.min(1, rev * 1.7) }}>
            {it.tag}
          </div>
        </div>
      )}
      {!compacta && revelada && (
        <div style={{ position: "absolute", left: 214, top: 118, right: 16, opacity: Math.min(1, rev * 1.6), transform: `translateY(${(1 - rev) * 18}px)` }}>
          <div style={{ fontFamily: theme.fontBody, fontWeight: 800, fontSize: 31, lineHeight: 1.02, textTransform: "uppercase", color: theme.ink }}>{it.title}</div>
          {it.note && <div style={{ marginTop: 8, fontFamily: theme.fontBody, fontWeight: 700, fontSize: 18, letterSpacing: "0.1em", lineHeight: 1.2, color: theme.inkSoft }}>{it.note}</div>}
        </div>
      )}
      {compacta && revelada && !it.image && (
        <div style={{ position: "absolute", left: 8, right: 8, top: 112, textAlign: "center", fontFamily: theme.fontBody, fontWeight: 800, fontSize: 21, lineHeight: 1.05, textTransform: "uppercase", color: theme.ink, opacity: Math.min(1, lin(t, it.at, it.at + 0.3)) }}>{it.title}</div>
      )}
    </div>
  );
};
