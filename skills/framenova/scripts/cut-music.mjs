#!/usr/bin/env node
// Recorta la pista de música desde un punto (y la pasa a wav 48 kHz) para que `music.src` empiece justo donde interesa.
//   node scripts/cut-music.mjs --in pista.mp3 --start 9.4 --len 60 --out public/audio/music.wav [--boost-intro 2 --boost-until 12]
import { mkdirSync } from "node:fs";
import path from "node:path";
import { arg, ffmpegMejor, run } from "./lib.mjs";

const ff = ffmpegMejor();
const inp = arg("in");
if (!ff || !inp) {
  console.error("Uso: node scripts/cut-music.mjs --in pista.mp3 --start 9.4 --len 60 --out public/audio/music.wav [--boost-intro 2 --boost-until 12]");
  process.exit(1);
}
const out = String(arg("out", "public/audio/music.wav"));
mkdirSync(path.dirname(out), { recursive: true });
const af = arg("boost-intro") ? ["-af", `volume=${arg("boost-intro")}:enable='lt(t,${arg("boost-until", 12)})'`] : [];
const r = run(ff.ffmpeg, ["-y", "-v", "error", "-ss", String(arg("start", 0)), "-t", String(arg("len", 60)), "-i", String(inp), ...af, "-ar", "48000", out]);
console.log(r.ok ? `OK ${out}` : r.out);
