import { AbsoluteFill, Loop, OffthreadVideo, Sequence, staticFile } from "remotion";
import { fps, lin, prog, resorte } from "../anim";
import { alfa, theme } from "../theme";

/**
 * ESTILO "PANTALLA TECH" (referencia: reels de edición con IA).
 * - Monitor: pantalla inclinada en perspectiva sobre rejilla oscura, texto que se escribe con brillo y una mini-interfaz.
 * - Slam: fogonazo a pantalla completa del color de acento con una palabra gigante condensada.
 * - Cromo: palabra gigante metálica con brillo (detrás de la persona si hay recorte).
 * - Titular: rótulo fijo arriba, condensado, durante todo el vídeo.
 */

const COND: React.CSSProperties = { fontFamily: theme.fontDisplay, fontVariationSettings: "'wdth' 75, 'opsz' 96", fontWeight: 800 };
const MONO = theme.fontMono;

/** Partes `*así*` del texto en acento. */
const conAcento = (txt: string, visibles: number, color: string) => {
  const trozos = txt.split(/(\*[^*]+\*)/g).filter(Boolean);
  let n = 0;
  return trozos.map((tr, i) => {
    const acento = tr.startsWith("*");
    const limpio = acento ? tr.slice(1, -1) : tr;
    const ver = limpio.slice(0, Math.max(0, visibles - n));
    n += limpio.length;
    return (
      <span key={i} style={acento ? { color, textShadow: `0 0 28px ${alfa(color, 0.85)}, 0 0 4px ${alfa(color, 0.9)}` } : undefined}>
        {ver}
      </span>
    );
  });
};
const largo = (txt: string) => txt.replace(/\*/g, "").length;

/** Rejilla en perspectiva que avanza despacio, con viñeta y halo de acento. */
export const Rejilla: React.FC<{ t: number; intensidad?: number }> = ({ t, intensidad = 1 }) => {
  const off = (t * 40) % 80;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 38%, ${theme.bg2} 0%, ${theme.bg} 65%, #040508 100%)` }}>
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 30%" }}>
        <div
          style={{
            position: "absolute",
            left: -1200,
            right: -1200,
            top: 860,
            height: 2600,
            transform: "rotateX(72deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `linear-gradient(${alfa(theme.accent, 0.28 * intensidad)} 2px, transparent 2px), linear-gradient(90deg, ${alfa(theme.accent, 0.22 * intensidad)} 2px, transparent 2px)`,
            backgroundSize: "80px 80px",
            backgroundPosition: `0 ${off}px`,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 30%, #000 100%)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${alfa("#FFFFFF", 0.035)} 1px, transparent 1px), linear-gradient(90deg, ${alfa("#FFFFFF", 0.035)} 1px, transparent 1px)`,
          backgroundSize: "54px 54px",
          maskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.4) 45%, transparent 60%)",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(40% 22% at 50% 44%, ${alfa(theme.accent, 0.16 * intensidad)}, transparent 70%)` }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(0,0,0,0.85)" }} />
    </AbsoluteFill>
  );
};

export type UiMonitor =
  | { tipo: "timeline"; pistas?: string[] }
  | { tipo: "flujo"; nodos: string[] }
  | { tipo: "carpetas"; items: string[] }
  | { tipo: "codigo"; lineas: string[] }
  | { tipo: "chat"; usuario: string; respuesta: string }
  | { tipo: "ninguna" };

/** Pantalla inclinada con texto que se escribe y mini interfaz. `t` = segundos desde que entra. */
export const Monitor: React.FC<{ t: number; dur: number; kicker?: string; titulo: string; ui: UiMonitor; giro?: number }> = ({ t, dur, kicker, titulo, ui, giro = -1 }) => {
  const e = resorte(t, 0, 120, 16);
  const sale = prog(t, dur - 0.35, dur);
  // el titular siempre termina de escribirse antes de la mitad de la pantalla (también en pantallas cortas)
  const cps = Math.max(34, largo(titulo) / Math.max(0.3, dur * 0.4));
  const vis = Math.floor(Math.max(0, t - 0.25) * cps);
  const cursor = Math.floor(t * 2.2) % 2 === 0 && vis < largo(titulo) + 6;
  const ry = giro * (16 - 6 * e) + giro * 3 * Math.sin(t * 0.6);
  const rx = 9 - 3 * e;
  const barrido = ((t * 0.45) % 1.6) - 0.3;
  return (
    <AbsoluteFill>
      <Rejilla t={t} />
      <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: "50% 42%", opacity: 1 - sale }}>
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 470,
            width: 940,
            height: 760,
            borderRadius: 22,
            transform: `translateY(${(1 - e) * 220}px) translateZ(${-200 * (1 - e) - 120 * sale}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${giro * -1.2}deg)`,
            transformStyle: "preserve-3d",
            background: "linear-gradient(170deg, rgba(26,30,40,0.96), rgba(9,11,16,0.97))",
            border: `2px solid ${alfa("#FFFFFF", 0.14)}`,
            boxShadow: `0 60px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.6), 0 0 90px ${alfa(theme.accent, 0.18)}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(${alfa("#FFFFFF", 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alfa("#FFFFFF", 0.05)} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 54, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: `1px solid ${alfa("#FFFFFF", 0.1)}`, background: "rgba(255,255,255,0.03)" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.85 }} />
            ))}
            <div style={{ marginLeft: 18, fontFamily: MONO, fontSize: 20, color: alfa("#FFFFFF", 0.45), letterSpacing: "0.04em" }}>claude — edición</div>
          </div>
          <div style={{ position: "absolute", left: 56, right: 56, top: 104 }}>
            {kicker && (
              <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.16em", textTransform: "uppercase", color: theme.accent, opacity: prog(t, 0.05, 0.4) }}>
                {"// " + kicker}
              </div>
            )}
            <div style={{ marginTop: 18, ...COND, fontSize: 92, lineHeight: 0.98, color: "#F4F6FA", textShadow: "0 0 30px rgba(255,255,255,0.25)", minHeight: 190 }}>
              {conAcento(titulo, vis, theme.accent)}
              <span style={{ display: "inline-block", width: 6, height: 76, marginLeft: 6, background: theme.accent, opacity: cursor ? 1 : 0, transform: "translateY(10px)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 56, right: 56, top: 400, bottom: 50 }}>
            <MiniUi ui={ui} t={t - 0.25 - largo(titulo) / cps} />
          </div>
          <div
            style={{
              position: "absolute",
              top: -200,
              bottom: -200,
              width: 220,
              left: `${barrido * 100}%`,
              transform: "rotate(18deg)",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MiniUi: React.FC<{ ui: UiMonitor; t: number }> = ({ ui, t }) => {
  const caja: React.CSSProperties = { border: `1.5px solid ${alfa("#FFFFFF", 0.16)}`, borderRadius: 12, background: "rgba(255,255,255,0.04)" };
  if (ui.tipo === "timeline") {
    const pistas = ui.pistas ?? ["VÍDEO", "SUBS", "FX", "MÚSICA"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {pistas.map((p, i) => {
          const a = prog(t, i * 0.12, i * 0.12 + 0.6);
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 130, fontFamily: MONO, fontSize: 20, color: alfa("#FFFFFF", 0.5) }}>{p}</div>
              <div style={{ flex: 1, height: 40, position: "relative" }}>
                {[0, 0.28, 0.55, 0.78].map((x, k) => (
                  <div key={k} style={{ position: "absolute", left: `${x * 100}%`, width: `${(0.2 + ((i + k) % 3) * 0.02) * 100 * a}%`, top: 0, bottom: 0, borderRadius: 8, background: i === 0 ? alfa(theme.accent, 0.85) : alfa(i % 2 ? theme.accent2 : "#FFFFFF", i % 2 ? 0.55 : 0.22) }} />
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: -10, bottom: 0, left: `${130 + 18 + 640 * lin(t, 0, 2.6)}px`, width: 3, background: theme.accent, boxShadow: `0 0 16px ${theme.accent}` }} />
      </div>
    );
  }
  if (ui.tipo === "flujo") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        {ui.nodos.map((n, i) => {
          const a = resorte(t, i * 0.35, 170, 14);
          const linea = prog(t, i * 0.35 + 0.2, i * 0.35 + 0.55);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", flex: i < ui.nodos.length - 1 ? 1 : "none" }}>
              <div style={{ ...caja, padding: "16px 20px", fontFamily: MONO, fontSize: 22, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", transform: `scale(${a})`, borderColor: i === ui.nodos.length - 1 ? theme.accent : alfa("#FFFFFF", 0.16), boxShadow: i === ui.nodos.length - 1 ? `0 0 30px ${alfa(theme.accent, 0.5)}` : "none" }}>
                {n}
              </div>
              {i < ui.nodos.length - 1 && <div style={{ flex: 1, height: 3, margin: "0 10px", background: `linear-gradient(90deg, ${theme.accent} ${linea * 100}%, transparent ${linea * 100}%)`, boxShadow: `0 0 10px ${alfa(theme.accent, 0.6)}` }} />}
            </div>
          );
        })}
      </div>
    );
  }
  if (ui.tipo === "carpetas") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {ui.items.map((it, i) => {
          const a = resorte(t, i * 0.22, 180, 14);
          return (
            <div key={it} style={{ ...caja, display: "flex", alignItems: "center", gap: 18, padding: "18px 20px", transform: `translateY(${(1 - a) * 40}px) scale(${0.9 + 0.1 * a})`, opacity: Math.min(1, a * 1.5) }}>
              <svg width={52} height={42} viewBox="0 0 52 42">
                <defs>
                  <linearGradient id={`cf${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={theme.accent2} />
                    <stop offset="1" stopColor={theme.accent} />
                  </linearGradient>
                </defs>
                <path d="M2 8 a6 6 0 0 1 6-6 h12 l6 6 h18 a6 6 0 0 1 6 6 v20 a6 6 0 0 1-6 6 H8 a6 6 0 0 1-6-6z" fill={`url(#cf${i})`} />
                <path d="M2 16 h48" stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
              </svg>
              <div style={{ fontFamily: theme.fontBody, fontWeight: 700, fontSize: 30, color: "#fff" }}>{it}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (ui.tipo === "codigo") {
    return (
      <div style={{ ...caja, padding: "20px 24px", fontFamily: MONO, fontSize: 26, lineHeight: 1.6, color: alfa("#FFFFFF", 0.8) }}>
        {ui.lineas.map((l, i) => (
          <div key={i} style={{ opacity: prog(t, i * 0.25, i * 0.25 + 0.2), whiteSpace: "pre" }}>
            <span style={{ color: theme.accent }}>{"> "}</span>
            {l.slice(0, Math.max(0, Math.floor((t - i * 0.25) * 40)))}
          </div>
        ))}
      </div>
    );
  }
  if (ui.tipo === "chat") {
    const a = resorte(t, 0, 170, 15);
    const b = resorte(t, 0.8, 170, 15);
    const burbuja: React.CSSProperties = { padding: "16px 22px", borderRadius: 22, fontFamily: theme.fontBody, fontSize: 28, fontWeight: 600, lineHeight: 1.25, maxWidth: "82%" };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ ...burbuja, alignSelf: "flex-end", background: alfa("#FFFFFF", 0.1), color: "#fff", transform: `translateY(${(1 - a) * 30}px)`, opacity: Math.min(1, a * 1.4) }}>{ui.usuario}</div>
        <div style={{ ...burbuja, alignSelf: "flex-start", background: `linear-gradient(160deg, ${alfa(theme.accent2, 0.35)}, ${alfa(theme.accent, 0.3)})`, border: `1.5px solid ${alfa(theme.accent, 0.6)}`, color: "#fff", transform: `translateY(${(1 - b) * 30}px)`, opacity: Math.min(1, b * 1.4) }}>
          {ui.respuesta.slice(0, Math.max(0, Math.floor((t - 0.9) * 45)))}
        </div>
      </div>
    );
  }
  return null;
};

/** Fogonazo de acento a pantalla completa con palabra gigante condensada que entra deslizando. */
export const Slam: React.FC<{ t: number; dur: number; texto: string }> = ({ t, dur, texto }) => {
  const entra = prog(t, 0, 0.12);
  const sale = prog(t, dur - 0.14, dur);
  const x = 140 - 200 * prog(t, 0, dur);
  // el tamaño se adapta al largo de la palabra (condensada ≈ 0,46 em por letra) para que quepa en 1080 px
  const tam = Math.min(330, 1010 / (Math.max(1, texto.length) * 0.46));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(140deg, ${theme.accent2} -30%, ${theme.accent} 45%, ${theme.accent} 100%)`, clipPath: `inset(${(1 - entra) * 50}% 0 ${(1 - entra) * 50}% 0)`, opacity: 1 - sale }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 50%, rgba(255,255,255,0.25), transparent 70%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ ...COND, fontSize: tam, lineHeight: 0.85, color: "#120A06", letterSpacing: "-0.03em", whiteSpace: "nowrap", transform: `translateX(${x}px) skewX(-6deg)`, textTransform: "uppercase" }}>{texto}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Palabra gigante metálica con brillo, para colocar detrás de la persona. */
export const Cromo: React.FC<{ t: number; dur: number; texto: string; y?: number; size?: number }> = ({ t, dur, texto, y = 520, size = 230 }) => {
  const e = resorte(t, 0, 140, 15);
  const sale = prog(t, dur - 0.3, dur);
  const brillo = ((t * 0.7) % 1.4) * 100 - 20;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `translateY(-50%) scale(${0.85 + 0.15 * e})`, opacity: Math.min(1, e * 1.4) * (1 - sale) }}>
      <span
        style={{
          ...COND,
          fontSize: size,
          lineHeight: 0.9,
          textTransform: "uppercase",
          whiteSpace: "pre",
          backgroundImage: `linear-gradient(100deg, #8D93A3 0%, #F4F6FA ${brillo - 8}%, #FFFFFF ${brillo}%, #9AA0AE ${brillo + 10}%, #DADDE4 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 24px ${alfa("#FFFFFF", 0.35)}) drop-shadow(0 18px 30px rgba(0,0,0,0.6))`,
        }}
      >
        {texto}
      </span>
    </div>
  );
};

/** `dur` = duración del clip en segundos (se repite en bucle si la tarjeta dura más). */
export type ItemTarjeta = { src: string; at: number; label?: string; dur?: number };

/**
 * Tarjetas flotantes con clips (estilo "mira lo que hacen otros"): cada clip entra en una tarjeta inclinada con sombra y
 * etiqueta blanca; la anterior se aparta hacia atrás y se queda de fondo. Los clips van en public/clips (sin audio).
 * `t` = segundos desde `from`; `at` de cada item también en segundos de salida.
 */
export const Tarjetas: React.FC<{ t: number; abs: number; to: number; items: ItemTarjeta[]; y?: number; dim?: number }> = ({ t, abs, to, items, y = 930, dim = 0.45 }) => {
  const entra = prog(t, 0, 0.25);
  const sale = prog(abs, to - 0.25, to);
  return (
    <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: "50% 45%" }}>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${dim * entra * (1 - sale)})`, backdropFilter: `blur(${6 * entra * (1 - sale)}px)` }} />
      {items.map((it, i) => {
        if (abs < it.at - 0.02) {
          return null;
        }
        const sig = items[i + 1]?.at ?? Infinity;
        const e = resorte(abs, it.at, 170, 15);
        const atras = resorte(abs, sig, 150, 16); // 0→1 cuando entra la siguiente
        const lado = i % 2 === 0 ? 1 : -1;
        const capas = items.filter((x) => abs >= x.at).length - 1 - i; // cuántas tiene delante
        if (capas > 2) {
          return null;
        }
        const x = lado * (1 - e) * 120 + lado * -220 * atras * Math.min(1, capas);
        const ty = (1 - e) * 360 - 40 * Math.min(capas, 2);
        const z = -260 * Math.min(capas, 2);
        const rotY = lado * (-14 * (1 - e) + 9 * atras);
        const rotZ = lado * (2.5 - 4 * atras);
        const op = Math.min(1, e * 2) * (1 - sale) * (capas >= 2 ? 0.5 : 1);
        const rel = Math.max(0, abs - it.at);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - 290,
              top: y - 470,
              width: 580,
              height: 940,
              transform: `translate3d(${x}px, ${ty + Math.sin((abs + i) * 1.3) * 6}px, ${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${0.85 + 0.15 * e})`,
              opacity: op,
              filter: `blur(${(1 - Math.min(1, e * 1.4)) * 10 + (capas >= 1 ? 2 : 0)}px)`,
            }}
          >
            <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden", border: `3px solid ${alfa("#FFFFFF", 0.85)}`, boxShadow: `0 50px 120px rgba(0,0,0,0.7), 0 0 60px ${alfa(theme.accent, 0.25)}`, background: "#000" }}>
              {/* el clip empieza en su propio `at` (Sequence desplaza el tiempo del vídeo) */}
              <Sequence from={Math.round(it.at * fps())} layout="none">
                <Loop durationInFrames={Math.max(1, Math.floor((it.dur ?? 1.5) * fps()) - 1)} layout="none">
                  <OffthreadVideo src={staticFile(it.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Loop>
              </Sequence>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255,${0.18 * (1 - prog(rel, 0, 0.7))}) 45%, transparent 60%)` }} />
            </div>
            {it.label && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -46,
                  transform: `translateX(-50%) scale(${resorte(abs, it.at + 0.15, 220, 14)})`,
                  background: "#FFFFFF",
                  color: "#0B0A08",
                  borderRadius: 14,
                  padding: "10px 26px 12px",
                  fontFamily: theme.fontBody,
                  fontWeight: 800,
                  fontSize: 50,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                }}
              >
                {it.label}
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Rótulo fijo arriba (como el texto del reel de referencia): condensado, blanco con contorno y pastilla de acento. */
export const Titular: React.FC<{ t: number; lineas: string[]; y?: number }> = ({ t, lineas, y = 170 }) => {
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center" }}>
      {lineas.map((l, i) => {
        const e = resorte(t, 0.05 + i * 0.12, 200, 15);
        return (
          <div key={i} style={{ ...COND, fontSize: 112, lineHeight: 0.98, textTransform: "uppercase", color: "#FFFFFF", WebkitTextStroke: "10px #0A0A0A", paintOrder: "stroke fill", textShadow: "0 14px 30px rgba(0,0,0,0.5)", transform: `translateY(${(1 - e) * -40}px)`, opacity: Math.min(1, e * 1.5) }}>
            {conAcento(l, 999, theme.accent)}
          </div>
        );
      })}
    </div>
  );
};

/**
 * LOGO (spec: {type:"logo", src, from, to, text?, bg?, y?, size?}). Con `bg` (por defecto) es un fogonazo oscuro con
 * halo del acento, el logo entra con resorte y giro y el nombre debajo; sin `bg` el logo aparece flotando en `y`
 * (p. ej. cuando se nombra la herramienta de pasada). Usa SOLO el logo que te dé el usuario.
 */
export const Logo: React.FC<{ t: number; dur: number; src: string; texto?: string; bg?: boolean; y?: number; size?: number }> = ({ t, dur, src, texto, bg = true, y = 860, size }) => {
  const e = resorte(t, 0.02, 170, 11);
  const sale = prog(t, dur - 0.16, dur);
  const ancho = size ?? (bg ? 560 : 300);
  const flota = Math.sin(t * 3.2) * 8;
  const logo = (
    <img
      src={staticFile(src)}
      style={{
        width: ancho,
        imageRendering: "pixelated",
        transform: `translateY(${flota}px) scale(${0.4 + 0.6 * e}) rotate(${(1 - Math.min(1, e)) * -14}deg)`,
        filter: `drop-shadow(0 0 ${bg ? 60 : 30}px ${alfa(theme.accent, 0.55)}) drop-shadow(0 18px 30px rgba(0,0,0,0.6))`,
      }}
    />
  );
  if (!bg) {
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: "translateY(-50%)", opacity: Math.min(1, e * 1.5) * (1 - sale) }}>{logo}</div>
    );
  }
  const abre = prog(t, 0, 0.14);
  return (
    <AbsoluteFill style={{ background: theme.bg, clipPath: `circle(${abre * 120}% at 50% 48%)`, opacity: 1 - sale }}>
      <AbsoluteFill style={{ background: `radial-gradient(55% 38% at 50% 46%, ${alfa(theme.accent, 0.45)}, transparent 70%)` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 70 }}>
        {logo}
        {texto && (
          <div style={{ ...COND, fontSize: 210, lineHeight: 0.85, color: "#FFFFFF", letterSpacing: "0.02em", textTransform: "uppercase", opacity: prog(t, 0.08, 0.3), transform: `translateY(${(1 - prog(t, 0.08, 0.35)) * 40}px)`, textShadow: `0 0 40px ${alfa(theme.accent, 0.5)}` }}>{texto}</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
