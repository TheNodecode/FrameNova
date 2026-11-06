#!/usr/bin/env node
// Crea la carpeta del proyecto a partir de la plantilla y escribe brand.json con las respuestas de la entrevista.
//   node init-project.mjs --dir mi-reel --name "Acme" --preset ai-futurista --accent "#7C5CFF" --accent2 "#22D3EE" --logo ./logo.png --tagline "..." --handle "@acme" --format vertical --fps 30
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { arg } from "./lib.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const plantilla = path.join(aqui, "..", "template");
const dir = path.resolve(String(arg("dir", "mi-reel")));
if (existsSync(path.join(dir, "package.json"))) {
  console.error(`Ya existe un proyecto en ${dir}. Usa otra carpeta (--dir).`);
  process.exit(1);
}
cpSync(plantilla, dir, { recursive: true, filter: (s) => !s.includes("node_modules") });
cpSync(path.join(aqui), path.join(dir, "scripts"), { recursive: true }); // los scripts viajan con el proyecto

const preset = String(arg("preset", "ai-futurista"));
const brand = JSON.parse(readFileSync(path.join(dir, "brand.json"), "utf8"));
brand.name = String(arg("name", brand.name));
brand.preset = preset;
brand.accent = arg("accent", null) || null;
brand.accent2 = arg("accent2", null) || null;
brand.tagline = String(arg("tagline", brand.tagline));
brand.handle = String(arg("handle", brand.handle));
const logo = arg("logo", null);
if (logo && typeof logo === "string" && existsSync(logo)) {
  mkdirSync(path.join(dir, "public", "brand"), { recursive: true });
  copyFileSync(logo, path.join(dir, "public", "brand", "logo" + path.extname(logo)));
  brand.logo = "brand/logo" + path.extname(logo);
}
writeFileSync(path.join(dir, "brand.json"), JSON.stringify(brand, null, 2));

const formatos = { vertical: [1080, 1920], cuadrado: [1080, 1080], horizontal: [1920, 1080], "4:5": [1080, 1350] };
const [width, height] = formatos[String(arg("format", "vertical"))] ?? formatos.vertical;
const spec = JSON.parse(readFileSync(path.join(dir, "project", "spec.json"), "utf8"));
spec.format = { width, height, fps: Number(arg("fps", 30)) };
writeFileSync(path.join(dir, "project", "spec.json"), JSON.stringify(spec, null, 2));

console.log(`\n  ✓ Proyecto creado en ${dir}\n  ✓ Estilo: ${preset}   Marca: ${brand.name}\n\n  Siguiente:\n    cd "${dir}"\n    npm install\n    npm run dev        (vista previa en el navegador con la demo)\n`);
