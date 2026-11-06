#!/usr/bin/env node
// Saca fotogramas sueltos del montaje (sin renderizar el vídeo) para revisarlos: la forma barata de iterar.
//   node scripts/stills.mjs --at 0.5,3,8.2 [--scale 0.4] [--out work/stills]
// Usa UNA sola llamada con todos los segundos (cada llamada empaqueta el proyecto: tarda ~1-4 min).
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { arg } from "./lib.mjs";

// se resuelve desde el node_modules del PROYECTO (el script vive en <proyecto>/scripts)
const req = createRequire(path.join(process.cwd(), "package.json"));
const { bundle } = req("@remotion/bundler");
const { renderStill, selectComposition } = req("@remotion/renderer");
const out = path.resolve(String(arg("out", "work/stills")));
mkdirSync(out, { recursive: true });
const segundos = String(arg("at", "0.5")).split(",").map(Number);
const escala = Number(arg("scale", 0.4));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "angle" };
const comp = await selectComposition({ serveUrl, id: "Reel", chromiumOptions, timeoutInMilliseconds: 180000 });
for (const s of segundos) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps));
  await renderStill({ composition: comp, serveUrl, frame, scale: escala, chromiumOptions, timeoutInMilliseconds: 180000, output: path.join(out, `s${String(s).replace(".", "_")}.png`) });
  console.log("ok", s);
}
