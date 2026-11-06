#!/usr/bin/env node
// Comprueba que el ordenador tiene todo lo necesario y dice EXACTAMENTE qué instalar si falta algo.
import { esWin, ffmpegCompleto, ffmpegRemotion, python, run, tiene } from "./lib.mjs";

const filas = [];
const ok = (n, v, ayuda = "") => filas.push({ n, ok: true, v, ayuda });
const falta = (n, ayuda, critico = true) => filas.push({ n, ok: false, v: critico ? "FALTA" : "opcional", ayuda, critico });

const nodeMajor = Number(process.versions.node.split(".")[0]);
nodeMajor >= 20 ? ok("Node.js", process.versions.node) : falta("Node.js ≥ 20", esWin ? "winget install OpenJS.NodeJS.LTS" : "brew install node  (o https://nodejs.org)");

tiene("npm") ? ok("npm", run("npm -v", [], { shell: true }).out.trim()) : falta("npm", "viene con Node.js");

const ff = ffmpegCompleto();
ff
  ? ok("ffmpeg completo", run("ffmpeg", ["-version"]).out.split("\n")[0].slice(0, 60))
  : falta("ffmpeg completo", esWin ? "winget install Gyan.FFmpeg   (y reinicia la terminal)" : "brew install ffmpeg   /   sudo apt install ffmpeg", false);
if (!ff) filas.push({ n: "  ↳ sin él NO funcionan", ok: true, v: "", ayuda: "LUTs de cámara (S-Log3…), loudnorm, denoise, estabilizar. Todo lo demás sí funciona con el ffmpeg de Remotion." });

const rem = ffmpegRemotion();
rem ? ok("ffmpeg de Remotion", "incluido (tras npm install)") : filas.push({ n: "ffmpeg de Remotion", ok: true, v: "se instala con npm install", ayuda: "" });

const py = python();
if (py) {
  const np = run(py, ["-c", "import numpy;print(numpy.__version__)"]);
  np.ok ? ok(`Python (${py}) + numpy`, np.out.trim()) : falta("numpy", `${py} -m pip install numpy`, false);
  const on = run(py, ["-c", "import onnxruntime,PIL"]);
  on.ok ? ok("onnxruntime + pillow (recorte de personas)", "ok") : falta("onnxruntime + pillow", `${py} -m pip install onnxruntime pillow   (solo para poner gráficos DETRÁS de la persona)`, false);
} else {
  falta("Python 3", esWin ? "winget install Python.Python.3.12" : "brew install python", false);
}

console.log("\n  FRAMENOVA · comprobación del equipo\n");
for (const f of filas) console.log(`  ${f.ok ? "✓" : f.critico ? "✗" : "·"} ${f.n.padEnd(46)} ${f.v}${f.ayuda ? `\n      → ${f.ayuda}` : ""}`);
const critico = filas.some((f) => !f.ok && f.critico);
console.log(critico ? "\n  Faltan cosas imprescindibles (✗). Instálalas y vuelve a ejecutar.\n" : "\n  Todo lo imprescindible está. Lo marcado con · es opcional y amplía lo que se puede hacer.\n");
process.exit(critico ? 1 : 0);
