import { Easing, interpolate, spring, useCurrentFrame } from "remotion";

/** FPS de la composición (lo fija `Reel` al empezar; las utilidades de animación trabajan en SEGUNDOS). */
let FPS = 30;
export const setFps = (f: number) => {
  FPS = f;
};
export const fps = () => FPS;

/** Segundo actual de la composición. */
export const useT = () => useCurrentFrame() / FPS;

export const suave = Easing.bezier(0.33, 0, 0.1, 1);
export const lenta = Easing.bezier(0.4, 0, 0.6, 1);

/** Progreso 0→1 de `v` entre `a` y `b` (segundos), suavizado. */
export const prog = (v: number, a: number, b: number, easing: (n: number) => number = suave) =>
  interpolate(v, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Lineal 0→1. */
export const lin = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/** Resorte (con pequeño rebote) que arranca en `t0` segundos. */
export const resorte = (t: number, t0: number, rigidez = 150, amort = 13) =>
  spring({ frame: Math.max(0, Math.round((t - t0) * FPS)), fps: FPS, config: { damping: amort, stiffness: rigidez, mass: 0.8 } });
