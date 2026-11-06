#!/usr/bin/env node
// Prepara el material de cámara para editar: lo conforma a vertical/cuadrado/horizontal, lo convierte a H.264 (Remotion NO lee bien
// HEVC de 10 bits del iPhone/Sony), aplica la LUT de LOG si hay ffmpeg completo, mejora el audio y extrae el audio 16 kHz para transcribir.
//   node scripts/prep-footage.mjs --in "C:/clips/video.mov" [--format vertical] [--fps 30|source] [--lut luts/slog3-cine.cube] [--denoise] [--loudnorm]
// Salida: public/video/main.mp4 (listo para Remotion) + work/audio16k.wav
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { arg, ffmpegMejor, run, sonda } from "./lib.mjs";

const entrada = arg("in");
if (!entrada || typeof entrada !== "string" || !existsSync(entrada)) {
  console.error('Uso: node scripts/prep-footage.mjs --in "ruta/video.mov" [--format vertical|cuadrado|horizontal|4:5] [--fps 30|source] [--lut luts/x.cube] [--denoise] [--loudnorm]');
  process.exit(1);
}
const ff = ffmpegMejor();
if (!ff) {
  console.error("No encuentro ffmpeg. Ejecuta `npm install` (trae el de Remotion) o instala ffmpeg completo: node scripts/doctor.mjs");
  process.exit(1);
}
const info = sonda(ff.ffprobe, entrada);
if (!info) {
  console.error("No puedo leer el vídeo con ffprobe.");
  process.exit(1);
}
const formatos = { vertical: [1080, 1920], cuadrado: [1080, 1080], horizontal: [1920, 1080], "4:5": [1080, 1350] };
const [W, H] = formatos[String(arg("format", "vertical"))] ?? formatos.vertical;
const fps = arg("fps", "source") === "source" ? Math.round(info.fps * 1000) / 1000 : Number(arg("fps"));
const lut = arg("lut", null);
const filtros = [];
// iPhone/cámaras en HDR (HLG o PQ): pasar a SDR Rec.709 con tone-mapping, si no se ve quemado o apagado
const hdr = ["arib-std-b67", "smpte2084"].includes(info.color_transfer ?? "");
if (hdr) {
  filtros.push("zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709", "tonemap=tonemap=hable:desat=0", "zscale=t=bt709:m=bt709:r=tv");
  console.log("Detectado vídeo HDR (" + info.color_transfer + "): se convierte a SDR Rec.709 con tone-mapping.");
}
// reencuadre a cubrir (recorta lo que sobra, sin deformar) y a la medida exacta
filtros.push(`scale=w=${W}:h=${H}:force_original_aspect_ratio=increase`, `crop=${W}:${H}`);
if (lut && typeof lut === "string") {
  if (!ff.completo) {
    console.warn("AVISO: sin ffmpeg completo no puedo aplicar la LUT aquí. Usa `python scripts/make-lut.py --camera slog3 --grade project/spec.json` (la conversión se aplica en Remotion) o instala ffmpeg.");
  } else {
    // la LUT se aplica ANTES de escalar, con la resolución y el color originales
    filtros.unshift(`lut3d=file='${lut.replace(/\\/g, "/").replace(":", "\\:")}'`);
  }
}
if (arg("denoise") && ff.completo) filtros.push("hqdn3d=1.5:1.5:6:6");
filtros.push("format=yuv420p");

mkdirSync("public/video", { recursive: true });
mkdirSync("work", { recursive: true });
const salida = path.resolve("public/video/main.mp4");
const args = ["-y", "-v", "error", "-i", entrada, "-vf", filtros.join(","), "-r", String(fps), "-c:v", "libx264", "-preset", "slow", "-crf", "9", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-g", String(Math.round(fps))];
const af = [];
if (arg("loudnorm")) af.push("loudnorm=I=-16:TP=-1.5:LRA=11");
args.push("-c:a", "aac", "-b:a", "320k", ...(af.length ? ["-af", af.join(",")] : []), "-movflags", "+faststart", salida);
console.log(`Entrada: ${info.width}x${info.height} @ ${info.fps.toFixed(3)} fps, ${info.codec_name}, ${info.pix_fmt}, transfer=${info.color_transfer ?? "?"}`);
console.log(`Salida:  ${W}x${H} @ ${fps} fps  ${lut && ff.completo ? "(con LUT) " : ""}${arg("loudnorm") ? "(audio normalizado a -16 LUFS)" : "(audio original SIN tocar)"}`);
const r = run(ff.ffmpeg, args);
if (!r.ok) {
  console.error(r.out);
  process.exit(1);
}
const a = run(ff.ffmpeg, ["-y", "-v", "error", "-i", salida, "-vn", "-ac", "1", "-ar", "16000", "work/audio16k.wav"]);
if (!a.ok) console.error(a.out);
console.log(`OK ${salida}\nOK work/audio16k.wav\n  Ahora: node scripts/prepare.mjs   (transcribe + cortes + envolvente)`);
