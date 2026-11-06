#!/usr/bin/env node
// Instala FrameNova como skill de Claude Code (o de cualquier agente que lea SKILL.md).
//   node install.mjs                 → ~/.claude/skills/framenova   (global: disponible en todos tus proyectos)
//   node install.mjs --project       → ./.claude/skills/framenova   (solo este proyecto)
//   node install.mjs --dir <ruta>    → la carpeta de skills de tu agente (Cursor, Codex, opencode…)
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const a = process.argv.slice(2);
const val = (n) => (a.includes(n) ? a[a.indexOf(n) + 1] : null);
const base = val("--dir") ?? (a.includes("--project") ? path.join(process.cwd(), ".claude", "skills") : path.join(homedir(), ".claude", "skills"));
const destino = path.join(base, "framenova");

if (path.resolve(destino) === path.resolve(aqui)) {
  console.log("Ya estás dentro de la carpeta de la skill instalada.");
  process.exit(0);
}
mkdirSync(base, { recursive: true });
if (existsSync(destino)) rmSync(destino, { recursive: true, force: true });
cpSync(aqui, destino, { recursive: true, filter: (s) => !/node_modules|\.git([\\/]|$)|\.DS_Store/.test(s) });
console.log(`\n  ✓ FrameNova instalada en ${destino}\n\n  Reinicia Claude Code y escribe, por ejemplo:\n\n     "Usa FrameNova para editar este vídeo: C:/videos/mi-video.mp4"\n\n  Claude te hará unas preguntas rápidas (marca, estilo, cámara, música…) y montará todo.\n`);
