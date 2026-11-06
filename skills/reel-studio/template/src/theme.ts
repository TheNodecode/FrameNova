import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import brand from "../brand.json";

/**
 * SISTEMA DE TEMA. Un solo archivo decide cómo se ve TODO: colores, tipografías, vidrio, fondos y tipo de subtítulo.
 * Se elige con `brand.json → preset` y se afina con `accent`, `accent2` y `overrides`. Para crear un estilo nuevo:
 * añade un preset aquí (copia el más parecido) y ponlo en brand.json.
 */
export type Look = "natural" | "clean" | "cine" | "moody" | "punch";
export type FondoTipo = "studio" | "aurora" | "grid" | "mesh";
export type EstiloSub = "pill" | "karaoke" | "impact" | "minimal";

export type Tokens = {
  dark: boolean;
  bg: string;
  bg2: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accent2: string;
  ok: string;
  warn: string;
  bad: string;
  glass: string;
  glassBorder: string;
  shadow: string;
  fontDisplay: string;
  fontBody: string;
  fontSerif: string;
  fontMono: string;
  displayWeight: number;
  displayTracking: string;
  radius: number;
  fondo: FondoTipo;
  subs: EstiloSub;
  look: Look;
};

const base = {
  ok: "#2FD38E",
  warn: "#FFC04D",
  bad: "#FF5B62",
  fontDisplay: "Bricolage",
  fontBody: "InterTight",
  fontSerif: "InstrumentSerif",
  fontMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  displayWeight: 800,
  displayTracking: "-0.03em",
  radius: 40,
};

export const PRESETS: Record<string, Tokens> = {
  /** Apple: blanco roto, tinta casi negra, un acento, cristal claro, mucho aire. Para todo lo "premium y limpio". */
  "apple-clean": {
    ...base,
    dark: false,
    bg: "#FBFBFD",
    bg2: "#EDEDF2",
    ink: "#1D1D1F",
    inkSoft: "#6E6E73",
    accent: "#0071E3",
    accent2: "#7C5CFF",
    glass: "rgba(255,255,255,0.78)",
    glassBorder: "rgba(255,255,255,0.95)",
    shadow: "0 30px 70px rgba(30,40,60,0.22)",
    fondo: "studio",
    subs: "pill",
    look: "clean",
  },
  /** IA / futurista: negro azulado, aurora violeta + cian, cristal oscuro y brillos. */
  "ai-futurista": {
    ...base,
    dark: true,
    bg: "#05060F",
    bg2: "#0D1024",
    ink: "#F4F6FF",
    inkSoft: "#9AA3C7",
    accent: "#7C5CFF",
    accent2: "#22D3EE",
    glass: "rgba(20,22,48,0.72)",
    glassBorder: "rgba(160,170,255,0.32)",
    shadow: "0 30px 80px rgba(2,3,20,0.7)",
    fondo: "aurora",
    subs: "pill",
    look: "cine",
  },
  /** Tech / SaaS / automatización: grafito, rejilla en perspectiva, acento eléctrico + lima. */
  "neo-tech": {
    ...base,
    dark: true,
    bg: "#090B10",
    bg2: "#141821",
    ink: "#F2F4F8",
    inkSoft: "#8B93A7",
    accent: "#3B82F6",
    accent2: "#A3E635",
    glass: "rgba(22,26,36,0.78)",
    glassBorder: "rgba(255,255,255,0.18)",
    shadow: "0 26px 70px rgba(0,0,0,0.6)",
    fondo: "grid",
    subs: "karaoke",
    look: "punch",
  },
  /** Lujo / editorial: negro, oro, serif grande, mucho contraste. */
  luxury: {
    ...base,
    dark: true,
    bg: "#0A0908",
    bg2: "#17130E",
    ink: "#F6F0E4",
    inkSoft: "#A89F8C",
    accent: "#C9A24B",
    accent2: "#F1D58B",
    glass: "rgba(28,22,14,0.72)",
    glassBorder: "rgba(241,213,139,0.35)",
    shadow: "0 30px 80px rgba(0,0,0,0.65)",
    fondo: "mesh",
    subs: "minimal",
    look: "moody",
    displayWeight: 600,
    displayTracking: "-0.01em",
  },
  /** Creador / impacto: amarillo-negro, palabras gigantes, subtítulos de una palabra. */
  "bold-creator": {
    ...base,
    dark: true,
    bg: "#0B0B0B",
    bg2: "#1A1A1A",
    ink: "#FFFFFF",
    inkSoft: "#B8B8B8",
    accent: "#FFE14A",
    accent2: "#FF4D6D",
    glass: "rgba(20,20,20,0.82)",
    glassBorder: "rgba(255,255,255,0.22)",
    shadow: "0 24px 60px rgba(0,0,0,0.6)",
    fondo: "mesh",
    subs: "impact",
    look: "punch",
  },
  /** Cálido y humano (clínicas, bienestar, educación): crema + rosa, cristal claro. */
  "warm-human": {
    ...base,
    dark: false,
    bg: "#FFF8F6",
    bg2: "#F9E4E8",
    ink: "#0A0A0F",
    inkSoft: "#7A6A70",
    accent: "#D4687B",
    accent2: "#E8929B",
    glass: "rgba(255,255,255,0.8)",
    glassBorder: "rgba(255,255,255,0.95)",
    shadow: "0 30px 70px rgba(150,60,85,0.26)",
    fondo: "studio",
    subs: "pill",
    look: "natural",
  },
};

type BrandJson = {
  name: string;
  preset: string;
  accent: string | null;
  accent2: string | null;
  logo: string | null;
  tagline: string;
  handle: string;
  overrides: Partial<Tokens>;
};
const b = brand as BrandJson;

export const marca = b;
export const theme: Tokens = {
  ...(PRESETS[b.preset] ?? PRESETS["ai-futurista"]),
  ...(b.accent ? { accent: b.accent } : {}),
  ...(b.accent2 ? { accent2: b.accent2 } : {}),
  ...(b.overrides ?? {}),
};

let cargadas = false;
/** Carga las tipografías incluidas (licencia OFL) una sola vez. */
export const cargarFuentes = () => {
  if (cargadas) {
    return;
  }
  cargadas = true;
  loadFont({ family: "Bricolage", url: staticFile("fonts/BricolageGrotesque.ttf"), weight: "200 800" });
  loadFont({ family: "InterTight", url: staticFile("fonts/InterTight.ttf"), weight: "100 900" });
  loadFont({ family: "InstrumentSerif", url: staticFile("fonts/InstrumentSerif-Italic.ttf"), weight: "400", style: "italic" });
};

/** Color con transparencia a partir de un #RRGGBB. */
export const alfa = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
