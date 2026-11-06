#!/usr/bin/env node
// UN SOLO COMANDO tras prep-footage: transcribe, calcula los cortes de silencio, genera la envolvente de voz y deja
// project/spec.json listo (formato, duración, vídeo, cortes) para que se añada el storyboard (capas, hojas, sonidos).
//   node scripts/prepare.mjs [--lang es] [--cut] [--min-silence 0.45] [--model medium] [--keep-demo]
//   --cut  aplica los cortes de silencio (jump cuts fluidos)   --keep-demo  conserva las capas de ejemplo
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { arg, ffmpegMejor, python, run, sonda } from "./lib.mjs";

const py = python();
if (!py) {
  console.error("Falta Python 3 (para cortes y envolvente). node scripts/doctor.mjs te dice cómo instalarlo.");
  process.exit(1);
}
if (!existsSync("public/video/main.mp4") || !existsSync("work/audio16k.wav")) {
  console.error("Primero: node scripts/prep-footage.mjs --in \"tu-video.mov\"");
  process.exit(1);
}
const ff = ffmpegMejor();
const info = ff ? sonda(ff.ffprobe, "public/video/main.mp4") : null;
const spec = JSON.parse(readFileSync("project/spec.json", "utf8"));

// 1 · transcripción (tarda ~1-2 min la primera vez: descarga el modelo de Whisper)
console.log("1/4 Transcribiendo (Whisper local)…");
const t = run("node", ["scripts/transcribe.mjs", "--audio", "work/audio16k.wav", "--lang", String(arg("lang", "es")), "--model", String(arg("model", "medium"))], { stdio: ["ignore", "pipe", "pipe"] });
if (!t.ok) {
  console.error(t.out.slice(-1500));
  process.exit(1);
}
console.log(readFileSync("work/transcription.txt", "utf8"));

// 2 · cortes de silencio
console.log("\n2/4 Buscando silencios…");
const c = run(py, ["scripts/silence-cuts.py", "work/audio16k.wav", "--min-silence", String(arg("min-silence", 0.45))]);
const segs = JSON.parse(c.out.split("\n").find((l) => l.startsWith("[[")) ?? "[]");
console.log(c.out.split("\n").filter((l) => l.startsWith("#")).join("\n"));

// 3 · spec
spec.video = { src: "video/main.mp4", ...(arg("cut") && segs.length ? { segments: segs } : {}) };
if (info) spec.format = { ...spec.format, fps: Math.round(info.fps * 1000) / 1000 === Math.round(info.fps) ? Math.round(info.fps) : info.fps, width: info.width, height: info.height };
const util = arg("cut") && segs.length ? segs.reduce((s, [a, b]) => s + (b - a), 0) : info?.duration ?? spec.durationSec;
const cierre = spec.closing?.seconds ?? 2.2;
spec.closing = { ...(spec.closing ?? {}), at: Math.round(util * 100) / 100, seconds: cierre };
spec.durationSec = Math.round((util + cierre) * 100) / 100;
if (!arg("keep-demo")) {
  spec.layers = [];
  spec.sheets = [];
  spec.punches = [];
  spec.sfx = [];
  delete spec.music;
}
writeFileSync("project/spec.json", JSON.stringify(spec, null, 2));

// 4 · envolvente (con los cortes aplicados si los hay)
console.log("\n3/4 Envolvente de voz…");
let cuts = [];
if (arg("cut") && segs.length) {
  writeFileSync("work/segments.json", JSON.stringify(segs));
  cuts = ["--cuts", "work/segments.json"];
}
const e = run(py, ["scripts/envelope.py", "work/audio16k.wav", "--out", "project/envelope.json", ...cuts]);
console.log(e.out.trim());
console.log(`\n4/4 Listo. project/spec.json: ${spec.format.width}x${spec.format.height} @ ${spec.format.fps} fps, ${spec.durationSec} s${arg("cut") ? " (con cortes de silencio)" : ""}.\n    Siguiente: escribir el storyboard (capas, hojas, sonidos) en project/spec.json y revisar con  node scripts/stills.mjs --at ...`);
if (arg("cut")) console.log("    ⚠ Con cortes, los tiempos de las capas son del vídeo de SALIDA (ya cortado). Las palabras se convierten solas.");
