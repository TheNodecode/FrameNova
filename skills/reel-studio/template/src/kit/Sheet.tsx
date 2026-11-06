import { AbsoluteFill } from "remotion";
import { lin, prog, useT } from "../anim";
import type { Sheet as SheetT } from "../spec";
import { theme } from "../theme";
import { Background } from "./Background";
import { SceneView } from "./Scenes";

const ENTRADA = 0.5;
const SALIDA = 0.45;

/** Progreso 0→1→0 de una hoja (entra en `from`, sale tras `to`). */
export const progresoHoja = (t: number, s: Pick<SheetT, "from" | "to">) => prog(t, s.from, s.from + ENTRADA) * (1 - prog(t, s.to, s.to + SALIDA));

/** Camino de 6 persianas que se abren de arriba abajo con retardo. */
const persiana = (p: number, h: number, w: number) => {
  const n = 6;
  const ww = w / n;
  return Array.from({ length: n }, (_, i) => `M${i * ww - 1} 0h${ww + 2}v${h * prog(p, i * 0.09, i * 0.09 + 0.5, (x) => x)}h${-(ww + 2)}z`).join("");
};

/** Hoja a pantalla completa con 5 transiciones de entrada: sube (hoja de iOS), iris, izq, dcha y persiana. */
export const SheetView: React.FC<{ s: SheetT; width: number; height: number }> = ({ s, width, height }) => {
  const t = useT();
  const p = progresoHoja(t, s);
  if (p <= 0.001) {
    return null;
  }
  const rel = t - s.from;
  const contenido = (
    <AbsoluteFill>
      <Background tipo={s.background} fase={s.from} />
      <SceneView scene={s.scene} t={rel} />
    </AbsoluteFill>
  );
  const radio = 64 * (1 - lin(p, 0.8, 1));
  switch (s.transition) {
    case "iris":
      return (
        <AbsoluteFill style={{ clipPath: `circle(${p * Math.hypot(width, height)}px at 50% 52%)` }}>
          <AbsoluteFill style={{ transform: `scale(${1.08 - 0.08 * p})` }}>{contenido}</AbsoluteFill>
        </AbsoluteFill>
      );
    case "persiana":
      return (
        <AbsoluteFill style={{ clipPath: `path('${persiana(p, height, width)}')` }}>
          <AbsoluteFill style={{ transform: `scale(${1.06 - 0.06 * p})` }}>{contenido}</AbsoluteFill>
        </AbsoluteFill>
      );
    case "izq":
    case "dcha": {
      const lado = s.transition === "izq" ? -1 : 1;
      return (
        <AbsoluteFill style={{ transform: `translateX(${lado * (1 - p) * width}px)`, borderRadius: lado === -1 ? `0 ${radio}px ${radio}px 0` : `${radio}px 0 0 ${radio}px`, overflow: "hidden", boxShadow: `${-lado * 34}px 0 90px rgba(0,0,0,0.35)` }}>
          <AbsoluteFill style={{ transform: `translateX(${-lado * (1 - p) * 360}px)` }}>{contenido}</AbsoluteFill>
        </AbsoluteFill>
      );
    }
    default:
      return (
        <AbsoluteFill style={{ transform: `translateY(${(1 - p) * height}px)`, borderRadius: `${radio}px ${radio}px 0 0`, overflow: "hidden", boxShadow: "0 -34px 90px rgba(0,0,0,0.35)" }}>
          <AbsoluteFill style={{ transform: `translateY(${-(1 - p) * 420}px)` }}>{contenido}</AbsoluteFill>
        </AbsoluteFill>
      );
  }
};

export const fondoSolido = theme.bg;
