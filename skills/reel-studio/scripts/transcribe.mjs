#!/usr/bin/env node
// Transcribe con Whisper local (sin API ni internet tras la 1.ª descarga) y escribe project/words.json con tiempo por palabra.
//   node scripts/transcribe.mjs --audio audio16k.wav --lang es [--model medium]   (modelos: tiny, base, small, medium, large-v3-turbo)
// Ejecutar DENTRO de la carpeta del proyecto (necesita su node_modules).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { arg } from "./lib.mjs";

const req = createRequire(path.join(process.cwd(), "package.json"));
const { downloadWhisperModel, installWhisperCpp, transcribe } = req("@remotion/install-whisper-cpp");

const audio = path.resolve(String(arg("audio", "work/audio16k.wav")));
const lang = String(arg("lang", "es"));
const model = String(arg("model", "medium"));
const whisperPath = path.resolve(".whisper");
const version = "1.5.5";

mkdirSync(whisperPath, { recursive: true });
await installWhisperCpp({ to: whisperPath, version, printOutput: false });
await downloadWhisperModel({ model, folder: whisperPath, printOutput: false });
const r = await transcribe({ inputPath: audio, whisperPath, whisperCppVersion: version, model, language: lang, tokenLevelTimestamps: true });
mkdirSync("work", { recursive: true });
writeFileSync("work/transcription.json", JSON.stringify(r, null, 2));

const fix = (s) => (/[ÃÂ]/.test(s) ? Buffer.from(s, "latin1").toString("utf8") : s);
const ws = [];
for (const seg of r.transcription) {
  for (const t of seg.tokens ?? []) {
    const txt = fix(t.text);
    if (!txt.trim() || txt.startsWith("[")) continue;
    const nueva = txt.startsWith(" ") || ws.length === 0;
    if (nueva) ws.push({ t0: t.offsets.from / 1000, t1: t.offsets.to / 1000, text: txt.trim() });
    else {
      ws[ws.length - 1].text += txt.trim() === txt ? txt : txt.trim();
      ws[ws.length - 1].t1 = t.offsets.to / 1000;
    }
  }
}
writeFileSync("project/words.json", JSON.stringify(ws, null, 1));
const frases = [];
let cur = [];
for (const w of ws) {
  cur.push(w);
  if (/[.?!]$/.test(w.text)) (frases.push(cur), (cur = []));
}
if (cur.length) frases.push(cur);
const txt = frases.map((f) => `[${f[0].t0.toFixed(2)} -> ${f[f.length - 1].t1.toFixed(2)}] ${f.map((w) => w.text).join(" ")}`).join("\n");
writeFileSync("work/transcription.txt", txt);
console.log(txt, `\n\n${ws.length} palabras → project/words.json`);
