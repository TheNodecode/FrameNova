#!/usr/bin/env node
// Renderiza con la receta de máxima calidad para redes y deja el resultado listo para subir.
//   node scripts/render.mjs --name "Mi-reel" [--crf 10] [--audio-only] [--poster 1.2]
// Salida: out/READY/<name>.mp4 (+ <name>-poster.jpg si pasas --poster <segundo>) y copia faststart.
// Receta: H.264 High, yuv420p, bt709, PNG intermedio, AAC 320k 48 kHz, crf 10, preset slow, +faststart. Es lo que mejor sobrevive a Instagram/TikTok.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { arg, ffmpegMejor, run, esWin } from "./lib.mjs";

const nombre = String(arg("name", "reel")).replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]/g, "").trim().replace(/\s+/g, "-");
mkdirSync("out/READY", { recursive: true });
const crudo = path.resolve(`out/${nombre}-raw.${arg("audio-only") ? "aac" : "mp4"}`);
const final = path.resolve(`out/READY/${nombre}.mp4`);
const npx = esWin ? "npx.cmd" : "npx";

const base = ["remotion", "render", "src/index.ts", "Reel", crudo, "--concurrency=3", "--timeout=120000", "--gl=angle"];
const video = ["--codec=h264", `--crf=${arg("crf", 10)}`, "--x264-preset=slow", "--pixel-format=yuv420p", "--color-space=bt709", "--image-format=png", "--audio-bitrate=320k"];
const solo = ["--codec=aac", "--audio-bitrate=320k"];
console.log(`Renderizando ${arg("audio-only") ? "solo audio" : "vídeo"} → ${crudo}\n(un reel de 50 s tarda ~30-40 min en un portátil; el audio solo ~3 min)`);
const r = run(npx, [...base, ...(arg("audio-only") ? solo : video)], { shell: esWin });
if (!r.ok) {
  console.error(r.out.slice(-2000));
  process.exit(1);
}
const ff = ffmpegMejor();
if (!ff || arg("audio-only")) {
  console.log(`✓ ${crudo}\n  (para sustituir solo el audio de un vídeo ya renderizado: ffmpeg -i video.mp4 -ss 0.0427 -i audio.aac -map 0:v -map 1:a -c copy -movflags +faststart final.mp4  — el -ss 0.0427 compensa el cebado del AAC)`);
  process.exit(0);
}
run(ff.ffmpeg, ["-y", "-v", "error", "-i", crudo, "-c", "copy", "-movflags", "+faststart", final]);
if (arg("poster")) run(ff.ffmpeg, ["-y", "-v", "error", "-ss", String(arg("poster")), "-i", final, "-frames:v", "1", "-q:v", "2", final.replace(/\.mp4$/, "-poster.jpg")]);
console.log(`✓ LISTO PARA SUBIR: ${final}${existsSync(final.replace(/\.mp4$/, "-poster.jpg")) ? "\n✓ Portada: " + final.replace(/\.mp4$/, "-poster.jpg") : ""}\n  Verifica: python scripts/verify-export.py "${final}"`);
