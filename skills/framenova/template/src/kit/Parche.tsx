import { Img, staticFile, useCurrentFrame } from "remotion";
import { fps } from "../anim";
import { spec } from "../spec";
import parche from "../../public/parche/parche.json";

/**
 * Retoque de limpieza: capas RGBA (bordes suaves) que tapan un objeto no deseado (p. ej. una mosca) en fotogramas
 * concretos del vídeo ORIGINAL. Se coloca dentro del mismo contenedor que el vídeo para seguir su zoom/movimiento.
 * Se generan con un script (ver work/) a partir de los fotogramas originales; aquí solo se superponen.
 */
const P = parche as { frames: number[]; x: number; y: number; w: number; h: number };

/** Fotograma del vídeo original que se ve en el fotograma de salida `f` (según `video.segments`). */
const fuente = (f: number): number | null => {
  const F = fps();
  const segs = spec.video?.segments?.length ? spec.video.segments : [[0, spec.durationSec] as [number, number]];
  let acc = 0;
  for (const [a, b] of segs) {
    const ini = Math.round(acc * F);
    const dur = Math.max(1, Math.round((b - a) * F));
    if (f >= ini && f < ini + dur) {
      return Math.round(a * F) + (f - ini);
    }
    acc += b - a;
  }
  return null;
};

export const ParcheLimpieza: React.FC = () => {
  const f = useCurrentFrame();
  const src = fuente(f);
  if (src === null || !P.frames.includes(src)) {
    return null;
  }
  return (
    <Img
      src={staticFile(`parche/p${String(src).padStart(3, "0")}.png`)}
      style={{ position: "absolute", left: `${(P.x / spec.format.width) * 100}%`, top: `${(P.y / spec.format.height) * 100}%`, width: `${(P.w / spec.format.width) * 100}%`, height: `${(P.h / spec.format.height) * 100}%` }}
    />
  );
};
