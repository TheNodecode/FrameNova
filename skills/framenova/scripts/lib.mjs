// Utilidades compartidas por los scripts de FrameNova (Node 20+).
import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

export const esWin = process.platform === "win32";

/** Ejecuta un comando y devuelve {ok, out}. */
export const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: false, ...opts });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`, status: r.status };
};

/** ¿Existe el comando en el PATH? */
export const tiene = (cmd) => run(esWin ? "where" : "which", [cmd]).ok;

/** ffmpeg COMPLETO del sistema (necesario para LUT, loudnorm, denoise...). null si no está. */
export const ffmpegCompleto = () => (tiene("ffmpeg") ? "ffmpeg" : null);

/** ffmpeg/ffprobe que trae Remotion (recortado: sirve para convertir, escalar y cortar, no para filtros avanzados). */
export const ffmpegRemotion = (proyecto = process.cwd()) => {
  const base = path.join(proyecto, "node_modules", "@remotion");
  if (!existsSync(base)) return null;
  const carpeta = readdirSync(base).find((d) => d.startsWith("compositor-"));
  if (!carpeta) return null;
  const exe = (n) => path.join(base, carpeta, esWin ? `${n}.exe` : n);
  return existsSync(exe("ffmpeg")) ? { ffmpeg: exe("ffmpeg"), ffprobe: exe("ffprobe") } : null;
};

/** Mejor ffmpeg disponible: el completo si existe, si no el de Remotion. */
export const ffmpegMejor = (proyecto = process.cwd()) => {
  if (ffmpegCompleto()) return { ffmpeg: "ffmpeg", ffprobe: "ffprobe", completo: true };
  const r = ffmpegRemotion(proyecto);
  return r ? { ...r, completo: false } : null;
};

/** Python con numpy: busca python3/python/py. */
export const python = () => {
  for (const c of esWin ? ["python", "py", "python3"] : ["python3", "python"]) {
    if (tiene(c)) return c;
  }
  return null;
};

export const arg = (nombre, defecto = undefined) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > -1 ? (process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]) : defecto;
};

export const sonda = (ffprobe, fichero) => {
  const r = run(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,r_frame_rate,pix_fmt,color_space,color_transfer,color_primaries,duration", "-of", "json", fichero]);
  if (!r.ok) return null;
  try {
    const s = JSON.parse(r.out).streams[0];
    const [a, b] = s.r_frame_rate.split("/").map(Number);
    return { ...s, fps: b ? a / b : a, duration: Number(s.duration) };
  } catch {
    return null;
  }
};
