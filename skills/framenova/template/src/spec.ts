import type { EstiloSub, FondoTipo, Look } from "./theme";
import specJson from "../project/spec.json";
import wordsJson from "../project/words.json";

/**
 * LA ESPECIFICACIÓN (project/spec.json) ES EL "PANEL DE VARIABLES" DEL VÍDEO: tiempos, textos y qué efecto va dónde.
 * Todos los tiempos de capas, hojas, música y sonidos están en SEGUNDOS DEL VÍDEO DE SALIDA (ya con los cortes aplicados).
 * Solo `words.json` (la transcripción) está en tiempo del vídeo ORIGINAL; el motor lo convierte con `segments`.
 */
export type ColorRef = "ok" | "warn" | "bad" | "accent" | "accent2";

export type Layer =
  | { type: "giantWord"; text: string; from: number; to: number; y?: number; size?: number; dir?: 1 | -1; color?: ColorRef }
  | { type: "hook"; text: string; from: number; to: number; y?: number; size?: number }
  | { type: "burst"; at: number }
  | { type: "chip"; text: string; from: number; to: number; x?: number; y: number; color?: ColorRef }
  | { type: "stat"; from: number; to: number; y?: number; value: number; suffix?: string; prefix?: string; label: string; decimals?: number }
  | { type: "cards"; from: number; to: number; y?: number; items: CardItem[] }
  // estilo "pantalla tech" (kit/Pantalla.tsx): monitor y slam van ENCIMA de la persona; cromo DETRÁS
  | { type: "monitor"; from: number; to: number; kicker?: string; title: string; ui: UiMonitor; turn?: 1 | -1 }
  | { type: "slam"; from: number; to: number; text: string }
  | { type: "chrome"; from: number; to: number; text: string; y?: number; size?: number }
  | { type: "headline"; from: number; to: number; lines: string[]; y?: number }
  | { type: "clips"; from: number; to: number; items: ItemTarjeta[]; y?: number; dim?: number }
  | { type: "logo"; from: number; to: number; src: string; text?: string; bg?: boolean; y?: number; size?: number };

import type { ItemTarjeta, UiMonitor } from "./kit/Pantalla";

export type CardItem = { n?: string; title: string; tag?: string; tagColor?: ColorRef; note?: string; image?: string; at: number };

export type Scene =
  | { type: "title"; kicker?: string; title: string; accentWord?: string; lines?: string[] }
  | { type: "stat"; kicker?: string; value: number; suffix?: string; prefix?: string; label: string; bars?: number[] }
  | { type: "flow"; kicker?: string; title?: string; nodes: { label: string; sub?: string; at: number }[] }
  | { type: "list"; kicker?: string; title?: string; items: { text: string; at: number }[] }
  | { type: "code"; kicker?: string; title?: string; lines: string[]; file?: string }
  | { type: "neural"; kicker?: string; title?: string }
  | { type: "image"; kicker?: string; src: string; caption?: string };

export type Sheet = { from: number; to: number; transition: "sube" | "iris" | "izq" | "dcha" | "persiana"; scene: Scene; background?: FondoTipo };

export type Spec = {
  format: { width: number; height: number; fps: number };
  durationSec: number;
  video?: { src: string; segments?: [number, number][]; muted?: boolean; zoom?: number };
  matte?: { dir: string; max: number } | null;
  look?: Look | "grade";
  /** Conversión LOG→Rec.709 generada por scripts/make-lut.py --grade (curvas por canal + saturación). */
  grade?: { r: number[]; g: number[]; b: number[]; sat: number };
  sharpen?: number;
  subtitles: {
    enabled: boolean;
    style?: EstiloSub;
    y: number;
    maxChars?: number;
    /** Tamaño de letra de los subtítulos (px a 1080 de ancho). Por defecto 64. */
    size?: number;
    emphasis?: string[];
    lines?: [string, number, number][];
    zones?: { from: number; to: number; y: number; capsule?: boolean }[];
  };
  layers: Layer[];
  sheets: Sheet[];
  punches: number[];
  /** encuadre por plano: zoom fijo desde `at` (1 = plano general, 1.12 = primer plano) */
  framing?: { at: number; zoom: number }[];
  /** acabado de cine: viñeta, grano, bandas que abren y cierran */
  cine?: { grain?: number; vignette?: number; bars?: number; openSec?: number; closeSec?: number };
  music?: { src: string; startAt?: number; gain: number; duck?: number; fadeIn?: number; fadeOut?: number; dropAt?: number | null };
  sfx: { f: string; t: number; v: number }[];
  sfxGain?: number;
  closing?: { at: number; seconds: number; tagline?: string };
};

export const spec = specJson as unknown as Spec;
export type Word = { t0: number; t1: number; text: string };
export const wordsRaw = wordsJson as Word[];

/** Convierte un tiempo del vídeo ORIGINAL al de SALIDA (con los cortes). null si cae en un tramo cortado. */
export const aSalida = (ts: number): number | null => {
  const segs = spec.video?.segments;
  if (!segs || segs.length === 0) {
    return ts;
  }
  let acc = 0;
  for (const [a, b] of segs) {
    if (ts >= a && ts <= b) {
      return acc + (ts - a);
    }
    acc += b - a;
  }
  return null;
};

/** Transcripción ya en tiempo de salida (descarta las palabras de los tramos cortados). */
export const words: Word[] = wordsRaw
  .map((w) => {
    const a = aSalida(w.t0);
    const b = aSalida(Math.max(w.t0 + 0.01, w.t1 - 0.001));
    return a === null || b === null ? null : { t0: a, t1: Math.max(b, a + 0.05), text: w.text };
  })
  .filter((w): w is Word => w !== null);
