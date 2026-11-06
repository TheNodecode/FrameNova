import { spring } from "remotion";
import { fps, prog, useT } from "../anim";
import { spec, words, type Word } from "../spec";
import { alfa, theme, type EstiloSub } from "../theme";

/**
 * Subtítulos automáticos a partir de la transcripción (project/words.json), sin escribir ni un texto a mano.
 * Estilos: `pill` (la palabra que suena sobre pastilla de color), `karaoke` (la palabra que suena se enciende),
 * `impact` (una palabra gigante cada vez, estilo creador) y `minimal` (línea fina en serif). Se pueden fijar zonas con
 * `subtitles.zones` (altura y cápsula de cristal, p. ej. en la costura de una pantalla partida) y forzar líneas a mano
 * con `subtitles.lines`.
 */

type Linea = { palabras: { texto: string; t0: number; t1: number; enfasis: boolean }[]; t0: number; t1: number };

const PARADAS = new Set(["el", "la", "los", "las", "un", "una", "de", "del", "que", "y", "o", "a", "en", "con", "por", "para", "es", "se", "lo", "al", "su", "mi", "tu", "the", "and", "to", "of", "is", "in", "it", "for", "on", "a", "an"]);

/** Agrupa palabras en líneas cortas (≤ maxChars) cortando en pausas y signos de puntuación. */
export const construirLineas = (ws: Word[], maxChars: number, enfasis: string[] = []): Linea[] => {
  const lineas: Linea[] = [];
  let cur: Word[] = [];
  const cerrar = () => {
    if (!cur.length) {
      return;
    }
    const largo = cur.map((w) => w.text.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean);
    const clave = largo.reduce((m, w) => (w.length > m.length && !PARADAS.has(w.toLowerCase()) ? w : m), "");
    lineas.push({
      t0: cur[0].t0,
      t1: cur[cur.length - 1].t1,
      palabras: cur.map((w) => {
        const limpio = w.text.replace(/[^\p{L}\p{N}%$€]/gu, "");
        const forzado = enfasis.some((e) => e.toLowerCase() === limpio.toLowerCase());
        return { texto: w.text, t0: w.t0, t1: w.t1, enfasis: forzado || (enfasis.length === 0 && limpio === clave) || /\d/.test(limpio) };
      }),
    });
    cur = [];
  };
  ws.forEach((w, i) => {
    const prev = cur[cur.length - 1];
    const len = [...cur, w].map((x) => x.text).join(" ").length;
    if (cur.length && (len > maxChars || w.t0 - prev.t1 > 0.45)) {
      cerrar();
    }
    cur.push(w);
    if (/[.!?…]$/.test(w.text) || (/[,;:]$/.test(w.text) && cur.map((x) => x.text).join(" ").length > maxChars * 0.6) || i === ws.length - 1) {
      cerrar();
    }
  });
  return lineas;
};

const manual = (): Linea[] | null =>
  spec.subtitles.lines
    ? spec.subtitles.lines.map(([txt, a, b]) => {
        const ps = txt.split(" ");
        const total = ps.reduce((s, p) => s + p.replace(/\*/g, "").length + 1, 0);
        let acc = 0;
        return {
          t0: a,
          t1: b,
          palabras: ps.map((p) => {
            const t0 = a + ((b - a) * acc) / total;
            acc += p.replace(/\*/g, "").length + 1;
            return { texto: p.replace(/\*/g, ""), t0, t1: t0 + 0.2, enfasis: p.includes("*") };
          }),
        };
      })
    : null;

let cache: Linea[] | null = null;
const lineasTodas = () => {
  if (!cache) {
    cache = manual() ?? construirLineas(words, spec.subtitles.maxChars ?? 22, spec.subtitles.emphasis ?? []);
  }
  return cache;
};

export const Subtitulos: React.FC<{ enHoja?: number }> = ({ enHoja = 0 }) => {
  const t = useT();
  const F = fps();
  const lineas = lineasTodas();
  const i = lineas.findIndex((l, k) => t >= l.t0 - 0.05 && t < Math.min(lineas[k + 1] ? lineas[k + 1].t0 - 0.02 : Infinity, l.t1 + 0.35));
  if (!spec.subtitles.enabled || i < 0) {
    return null;
  }
  const l = lineas[i];
  const fin = Math.min(lineas[i + 1] ? lineas[i + 1].t0 - 0.02 : Infinity, l.t1 + 0.35);
  const sale = prog(t, fin - 0.1, fin);
  const estilo: EstiloSub = spec.subtitles.style ?? theme.subs;
  const zona = spec.subtitles.zones?.find((z) => t >= z.from && t < z.to);
  const capsula = !!zona?.capsule;
  const y = zona?.y ?? spec.subtitles.y;
  // sin vídeo debajo y con tema claro, el texto va en tinta (como sobre una hoja)
  const sobreHoja = enHoja > 0.5 || (!spec.video && !theme.dark);
  const tinta = sobreHoja && !theme.dark ? theme.ink : sobreHoja ? theme.ink : "#FFFFFF";
  const clave = sobreHoja ? theme.accent : theme.dark ? alfa(theme.accent2, 1) : "#FFFFFF";
  const sombra = sobreHoja ? "none" : "0 2px 0 rgba(0,0,0,0.5), 0 0 18px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.5)";

  // índice de la palabra que suena
  let act = 0;
  l.palabras.forEach((p, k) => {
    if (t >= p.t0 - 0.02) {
      act = k;
    }
  });

  if (estilo === "impact") {
    const p = l.palabras[act];
    const e = spring({ frame: Math.round((t - p.t0) * F), fps: F, config: { damping: 11, stiffness: 300, mass: 0.5 } });
    return (
      <div style={{ position: "absolute", left: 40, right: 40, top: y, transform: "translateY(-50%)", textAlign: "center", pointerEvents: "none", opacity: 1 - sale }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: theme.fontDisplay,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: p.enfasis ? theme.accent : "#FFFFFF",
            WebkitTextStroke: sobreHoja ? "0" : "6px #000",
            paintOrder: "stroke fill",
            textShadow: "0 12px 30px rgba(0,0,0,0.55)",
            transform: `scale(${0.6 + 0.4 * Math.min(1.12, e)}) rotate(${(1 - Math.min(1, e)) * -4}deg)`,
          }}
        >
          {p.texto.replace(/[.,;:!?]/g, "")}
        </span>
      </div>
    );
  }

  const tam = capsula ? 56 : 64;
  const maxLinea = capsula ? 28 : 20;
  const filas: typeof l.palabras[] = [];
  {
    let fila: typeof l.palabras = [];
    l.palabras.forEach((p) => {
      if (fila.length && [...fila, p].map((x) => x.texto).join(" ").length > maxLinea) {
        filas.push(fila);
        fila = [];
      }
      fila.push(p);
    });
    filas.push(fila);
  }
  const contenedor: React.CSSProperties = capsula
    ? { padding: "4px 26px", borderRadius: 40, background: theme.dark ? "linear-gradient(160deg, rgba(34,18,40,0.82), rgba(10,8,16,0.78))" : theme.glass, backdropFilter: "blur(16px)", border: `1.5px solid ${theme.glassBorder}`, boxShadow: "0 18px 44px rgba(0,0,0,0.45)" }
    : {};
  let idx = 0;

  return (
    <div style={{ position: "absolute", left: capsula ? 30 : 90, width: capsula ? 1020 : 900, top: y, transform: `translateY(-50%) translateY(${-sale * 10}px)`, display: "flex", justifyContent: "center", pointerEvents: "none", opacity: 1 - sale }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...contenedor }}>
        {filas.map((fila, r) => (
          <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: estilo === "pill" ? 2 : 14, whiteSpace: "nowrap", height: tam * 1.4 }}>
            {fila.map((p) => {
              const k = idx++;
              if (t < p.t0 - 0.05) {
                return <span key={k} style={{ display: "inline-block", width: 0, overflow: "hidden", opacity: 0 }} />;
              }
              const e = spring({ frame: Math.round((t - (p.t0 - 0.04)) * F), fps: F, config: { damping: 14, stiffness: 240, mass: 0.55 } });
              const pop = spring({ frame: Math.round((t - p.t0) * F), fps: F, config: { damping: 10, stiffness: 320, mass: 0.5 } });
              const activa = k === act;
              if (estilo === "minimal") {
                return (
                  <span key={k} style={{ fontFamily: theme.fontSerif, fontStyle: "italic", fontSize: tam * 1.1, color: p.enfasis ? clave : tinta, textShadow: sombra, opacity: Math.min(1, e * 1.8), transform: `translateY(${(1 - e) * 14}px)` }}>
                    {p.texto}
                  </span>
                );
              }
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    fontFamily: theme.fontBody,
                    fontWeight: 800,
                    fontSize: tam,
                    lineHeight: 1,
                    letterSpacing: "-0.015em",
                    textTransform: "uppercase",
                    padding: estilo === "pill" ? "10px 16px 8px" : "6px 4px",
                    borderRadius: 20,
                    color: estilo === "pill" ? (activa ? "#FFFFFF" : p.enfasis ? clave : tinta) : activa ? theme.accent : p.enfasis ? clave : tinta,
                    background: estilo === "pill" && activa ? `linear-gradient(160deg, ${alfa(theme.accent2, 1)} -20%, ${theme.accent} 60%)` : "transparent",
                    boxShadow: estilo === "pill" && activa ? `0 14px 30px ${alfa(theme.accent, 0.5)}, inset 0 2px 0 rgba(255,255,255,0.45)` : "none",
                    textShadow: estilo === "pill" && activa ? "0 2px 0 rgba(0,0,0,0.3)" : sombra,
                    opacity: Math.min(1, e * 1.8),
                    transform: `translateY(${(1 - e) * 26}px) scale(${(0.82 + 0.18 * e) * (activa ? 1 + 0.07 * pop : 1)})`,
                  }}
                >
                  {p.texto}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
