import { Img, staticFile, useVideoConfig } from "remotion";
import { lin, prog, resorte } from "../anim";
import type { Scene } from "../spec";
import { alfa, theme } from "../theme";

/**
 * ESCENAS DE HOJA (pantalla completa). Cada una recibe `t` = segundos desde que entra la hoja. Todas son vectoriales y
 * se adaptan al tema: titular editorial, cifra que cuenta, FLUJO de automatización (nodos con pulsos), lista con ✓,
 * ventana de CÓDIGO que se escribe, RED NEURONAL con señales e imagen de producto con brillo.
 */

const Kicker: React.FC<{ texto?: string; t: number }> = ({ texto, t }) =>
  texto ? (
    <div style={{ fontFamily: theme.fontBody, fontWeight: 800, fontSize: 28, letterSpacing: "0.26em", textTransform: "uppercase", color: theme.accent, opacity: prog(t, 0.1, 0.5), transform: `translateY(${(1 - prog(t, 0.1, 0.5)) * 18}px)` }}>
      {texto}
    </div>
  ) : null;

const Titular: React.FC<{ texto: string; acento?: string; t: number; tam?: number }> = ({ texto, acento, t, tam = 128 }) => {
  const partes = acento ? texto.split(acento) : [texto];
  const e = resorte(t, 0.2, 110, 14);
  return (
    <div style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, fontSize: tam, lineHeight: 0.98, letterSpacing: theme.displayTracking, color: theme.ink, transform: `translateY(${(1 - e) * 60}px)`, opacity: Math.min(1, e * 1.5) }}>
      {partes[0]}
      {acento && <span style={{ fontFamily: theme.fontSerif, fontStyle: "italic", fontWeight: 400, color: theme.accent, textShadow: `0 0 40px ${alfa(theme.accent, 0.5)}` }}>{acento}</span>}
      {partes[1] ?? ""}
    </div>
  );
};

const Marco: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 230, height: 1130, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>{children}</div>
);

export const SceneView: React.FC<{ scene: Scene; t: number }> = ({ scene, t }) => {
  const { width, height } = useVideoConfig();
  const k = "kicker" in scene ? scene.kicker : undefined;
  switch (scene.type) {
    case "title":
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          <Titular texto={scene.title} acento={scene.accentWord} t={t} />
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {(scene.lines ?? []).map((ln, i) => (
              <div key={i} style={{ fontFamily: theme.fontBody, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: theme.inkSoft, opacity: prog(t, 0.7 + i * 0.25, 1.1 + i * 0.25), transform: `translateX(${(1 - prog(t, 0.7 + i * 0.25, 1.1 + i * 0.25)) * 40}px)` }}>
                {ln}
              </div>
            ))}
          </div>
        </Marco>
      );
    case "stat": {
      const v = scene.value * prog(t, 0.3, 1.8);
      const bars = scene.bars ?? [];
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          <div style={{ fontFamily: theme.fontDisplay, fontWeight: theme.displayWeight, fontSize: 330, lineHeight: 1, letterSpacing: "-0.05em", color: theme.accent, textShadow: `0 0 80px ${alfa(theme.accent, 0.5)}` }}>
            {scene.prefix ?? ""}
            {Number.isInteger(scene.value) ? Math.round(v) : v.toFixed(1)}
            {scene.suffix ?? ""}
          </div>
          <div style={{ fontFamily: theme.fontBody, fontWeight: 700, fontSize: 44, color: theme.ink }}>{scene.label}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 380, marginTop: 40 }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, height: `${b * 100 * prog(t, 0.6 + i * 0.12, 1.4 + i * 0.12)}%`, borderRadius: 18, background: `linear-gradient(180deg, ${theme.accent2}, ${theme.accent})`, boxShadow: `0 0 30px ${alfa(theme.accent, 0.45)}` }} />
            ))}
          </div>
        </Marco>
      );
    }
    case "list":
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          {scene.title && <Titular texto={scene.title} t={t} tam={104} />}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 22 }}>
            {scene.items.map((it, i) => {
              const e = resorte(t, it.at, 160, 12);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 32px", borderRadius: theme.radius * 0.8, background: theme.glass, border: `1.5px solid ${theme.glassBorder}`, boxShadow: theme.shadow, transform: `translateX(${(1 - e) * 120}px)`, opacity: Math.min(1, e * 1.6) }}>
                  <svg width={64} height={64} viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="29" fill={alfa(theme.ok, 0.18)} stroke={theme.ok} strokeWidth={3} />
                    <path d="M18 33 L28 43 L46 22" fill="none" stroke={theme.ok} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - lin(t, it.at + 0.1, it.at + 0.5))} />
                  </svg>
                  <div style={{ fontFamily: theme.fontBody, fontWeight: 700, fontSize: 46, color: theme.ink }}>{it.text}</div>
                </div>
              );
            })}
          </div>
        </Marco>
      );
    case "flow": {
      const n = scene.nodes.length;
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          {scene.title && <Titular texto={scene.title} t={t} tam={104} />}
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {scene.nodes.map((nd, i) => {
              const e = resorte(t, nd.at, 160, 12);
              const prox = scene.nodes[i + 1];
              const cable = prox ? lin(t, nd.at + 0.1, prox.at) : 0;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 28, padding: "26px 34px", borderRadius: theme.radius * 0.8, background: theme.glass, border: `1.5px solid ${alfa(theme.accent, e > 0.5 ? 0.9 : 0.3)}`, boxShadow: `${theme.shadow}, 0 0 ${40 * e}px ${alfa(theme.accent, 0.35)}`, transform: `scale(${0.85 + 0.15 * e})`, opacity: Math.min(1, e * 1.6) }}>
                    <div style={{ width: 70, height: 70, borderRadius: 22, background: `linear-gradient(145deg, ${theme.accent2}, ${theme.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.fontDisplay, fontWeight: 800, fontSize: 38, color: "#fff", boxShadow: `0 0 30px ${alfa(theme.accent, 0.6)}` }}>{i + 1}</div>
                    <div>
                      <div style={{ fontFamily: theme.fontBody, fontWeight: 800, fontSize: 44, color: theme.ink }}>{nd.label}</div>
                      {nd.sub && <div style={{ fontFamily: theme.fontBody, fontWeight: 600, fontSize: 28, color: theme.inkSoft }}>{nd.sub}</div>}
                    </div>
                  </div>
                  {i < n - 1 && (
                    <div style={{ position: "relative", width: 6, height: 86, borderRadius: 3, background: alfa(theme.accent, 0.2) }}>
                      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${cable * 100}%`, borderRadius: 3, background: `linear-gradient(180deg, ${theme.accent2}, ${theme.accent})`, boxShadow: `0 0 18px ${theme.accent}` }} />
                      {cable >= 1 && <div style={{ position: "absolute", left: -7, top: ((t * 1.6) % 1) * 78, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: `0 0 20px ${theme.accent2}` }} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Marco>
      );
    }
    case "code": {
      const total = scene.lines.reduce((s, l) => s + l.length, 0) + scene.lines.length;
      const chars = Math.floor(total * lin(t, 0.6, 0.6 + Math.max(2.2, total / 28)));
      let usados = 0;
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          {scene.title && <Titular texto={scene.title} t={t} tam={104} />}
          <div style={{ marginTop: 30, borderRadius: 34, overflow: "hidden", background: theme.dark ? "rgba(6,8,18,0.92)" : "#0F1220", border: `1.5px solid ${theme.glassBorder}`, boxShadow: theme.shadow, transform: `translateY(${(1 - prog(t, 0.3, 0.9)) * 80}px)`, opacity: prog(t, 0.3, 0.8) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", background: "rgba(255,255,255,0.06)" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <span key={c} style={{ width: 20, height: 20, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ marginLeft: 16, fontFamily: theme.fontMono, fontSize: 26, color: "#8B93A7" }}>{scene.file ?? "automation.ts"}</span>
            </div>
            <div style={{ padding: "30px 34px", fontFamily: theme.fontMono, fontSize: 36, lineHeight: 1.55, color: "#D6DBF5", minHeight: 520 }}>
              {scene.lines.map((ln, i) => {
                const vis = Math.max(0, Math.min(ln.length, chars - usados));
                usados += ln.length + 1;
                const txt = ln.slice(0, vis);
                const cursor = vis > 0 && vis < ln.length;
                return (
                  <div key={i} style={{ whiteSpace: "pre", minHeight: 56 }}>
                    <span style={{ color: "#5B648A", marginRight: 22 }}>{String(i + 1).padStart(2, " ")}</span>
                    {txt.split(/(\b[A-Za-z_]+\b)/).map((tk, j) => (
                      <span key={j} style={{ color: /^(const|let|await|async|function|return|import|from|if|else|new)$/.test(tk) ? theme.accent2 : /^\d+$/.test(tk) ? theme.warn : tk.startsWith("'") ? theme.ok : "#D6DBF5" }}>
                        {tk}
                      </span>
                    ))}
                    {cursor && <span style={{ background: theme.accent2, width: 18, display: "inline-block", marginLeft: 2 }}>&nbsp;</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Marco>
      );
    }
    case "neural": {
      const capas = [3, 5, 5, 2];
      const W = width - 180;
      const H = 700;
      const pos = capas.map((c, li) => Array.from({ length: c }, (_, i) => ({ x: (li / (capas.length - 1)) * (W - 80) + 40, y: ((i + 1) / (c + 1)) * H })));
      return (
        <Marco>
          <Kicker texto={k} t={t} />
          {scene.title && <Titular texto={scene.title} t={t} tam={104} />}
          <svg width={W} height={H} style={{ marginTop: 20, overflow: "visible" }}>
            {pos.slice(0, -1).map((capa, li) =>
              capa.flatMap((a, i) =>
                pos[li + 1].map((b, j) => {
                  const fase = ((t * 0.9 + li * 0.25 + i * 0.07 + j * 0.05) % 1 + 1) % 1;
                  const vis = prog(t, 0.4 + li * 0.35, 0.9 + li * 0.35);
                  return (
                    <g key={`${li}-${i}-${j}`} opacity={vis}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alfa(theme.accent, 0.28)} strokeWidth={2} />
                      <circle cx={a.x + (b.x - a.x) * fase} cy={a.y + (b.y - a.y) * fase} r={5} fill={theme.accent2} opacity={0.9} />
                    </g>
                  );
                }),
              ),
            )}
            {pos.flat().map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={22 + 4 * Math.sin(t * 3 + i)} fill={alfa(theme.accent, 0.85)} stroke="#fff" strokeWidth={3} style={{ filter: `drop-shadow(0 0 14px ${theme.accent})` }} opacity={prog(t, 0.2 + (i % 4) * 0.3, 0.6 + (i % 4) * 0.3)} />
            ))}
          </svg>
        </Marco>
      );
    }
    case "image": {
      const e = resorte(t, 0.3, 110, 13);
      return (
        <div style={{ position: "absolute", left: 90, right: 90, top: 262, height: height - 800, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ alignSelf: "flex-start" }}>
            <Kicker texto={k} t={t} />
          </div>
          <div style={{ marginTop: 30, width: "100%", flex: 1, borderRadius: theme.radius, overflow: "hidden", background: theme.glass, border: `1.5px solid ${theme.glassBorder}`, boxShadow: theme.shadow, transform: `translateY(${(1 - e) * 140}px) scale(${0.9 + 0.1 * e}) rotate(${(1 - e) * -3}deg)`, opacity: Math.min(1, e * 1.6), position: "relative" }}>
            <Img src={staticFile(scene.src)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            <div style={{ position: "absolute", top: -40, bottom: -40, left: `${((t * 0.5) % 1.6) * 100 - 30}%`, width: 90, transform: "rotate(14deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))" }} />
          </div>
          {scene.caption && <div style={{ marginTop: 26, fontFamily: theme.fontBody, fontWeight: 800, fontSize: 42, color: theme.ink }}>{scene.caption}</div>}
        </div>
      );
    }
  }
};
