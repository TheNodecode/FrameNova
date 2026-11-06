#!/usr/bin/env python3
"""
SELECCIÓN DE TOMAS para grabaciones largas con muchas repeticiones ("lo grabé todo de largo").
Monta public/video/selects.mp4 con SOLO las tomas buenas: vídeo recodificado por tramos (exacto al fotograma) y audio
unido muestra a muestra con microfundidos de 4 ms (sin chasquidos ni desfase acumulado).

Uso:
  python scripts/select-takes.py --video "C:/ruta/original.mp4" --cuts work/cuts.json [--fps 23.976] [--out public/video/selects.mp4]

work/cuts.json = lista de tramos del ORIGINAL en segundos, en orden de montaje:
  [ {"src":[0.0,14.25],"idea":"gancho"}, {"src":[45.8,49.25],"idea":"tres pasos"}, {"src":[180.42,183.3],"idea":"…","fixed":true} ]
  Cada borde se ajusta al mínimo de energía de voz más cercano (salvo "fixed": true).

Cómo elegir los tramos (lo que funciona):
  1. Transcribe por TOMAS, no el audio entero: en audios largos y repetitivos Whisper entra en bucles y desplaza tiempos.
     Divide por pausas (≥0,5 s) y transcribe cada trozo por separado (whisper.cpp acepta varios -f en una llamada; usa
     -mc 0 para cortar el contexto entre trozos). Elige la mejor toma de cada idea (normalmente la última, la más fluida).
  2. Los tiempos por palabra de Whisper salen ADELANTADOS ~0,5 s: no cortes "en la palabra", cortes en la PAUSA (este
     script lo hace) y comprueba al final transcribiendo el extracto montado.
  3. Quita tartamudeos (una toma que repite el arranque de la siguiente).
Salida extra: work/plan_cortes.json (tiempos de salida de cada tramo) para sincronizar gráficos y subtítulos.
"""
import glob, json, os, subprocess, sys, wave
import numpy as np


def arg(n, d=None):
    a = sys.argv
    return a[a.index("--" + n) + 1] if "--" + n in a else d


VIDEO, CUTS = arg("video"), arg("cuts", "work/cuts.json")
FPS = float(arg("fps", 24000 / 1001))
OUT = arg("out", "public/video/selects.mp4")
FF = arg("ffmpeg") or (glob.glob("node_modules/@remotion/compositor-*/ffmpeg*") or ["ffmpeg"])[0]
if not VIDEO:
    sys.exit(__doc__)
os.makedirs("work/sel", exist_ok=True)
run = lambda *c: subprocess.run([FF, "-v", "error", "-y", *c], check=True)

run("-i", VIDEO, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", "work/sel/orig48k.wav")
w = wave.open("work/sel/orig48k.wav"); sr = w.getframerate()
A = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32)
mono = A.mean(1) / 32768
hop = sr // 100
rms = np.sqrt(np.convolve(mono ** 2, np.ones(hop * 2) / (hop * 2), "same")[::hop])  # 10 ms


def snap(t, lo, hi):
    i0, i1 = max(0, int((t + lo) * 100)), int((t + hi) * 100)
    return (i0 + int(np.argmin(rms[i0:i1]))) / 100 if i1 > i0 else t


cuts = json.load(open(CUTS, encoding="utf-8"))
parts, plan, acc = [], [], 0
with open("work/sel/lista.txt", "w", newline="\n") as lista:
    for k, c in enumerate(cuts):
        s, e = c["src"]
        if not c.get("fixed"):
            s = 0.0 if s == 0 else snap(s, -0.2, 0.08)
            e = snap(e, -0.08, 0.25)
        sf, ef = round(s * FPS), round(e * FPS)
        n = ef - sf
        a0 = round(sf / FPS * sr)
        p = A[a0:a0 + round(n / FPS * sr)].copy()
        f = int(0.004 * sr); r = np.linspace(0, 1, f)[:, None]
        p[:f] *= r; p[-f:] *= r[::-1]
        parts.append(p)
        run("-ss", f"{sf / FPS:.6f}", "-i", VIDEO, "-frames:v", str(n), "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "12",
            "-g", "24", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-r", f"{FPS}", f"work/sel/v{k:03d}.mp4")
        lista.write(f"file 'v{k:03d}.mp4'\n")
        plan.append({"idea": c.get("idea", ""), "src0": sf / FPS, "src1": ef / FPS, "out0": acc / FPS, "out1": (acc + n) / FPS, "sf": sf, "n": n})
        print(f"{c.get('idea',''):30s} {s:8.2f}-{e:8.2f}  sale en {acc / FPS:6.2f}")
        acc += n
au = np.concatenate(parts).clip(-32768, 32767).astype(np.int16)
o = wave.open("work/sel/audio.wav", "wb"); o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes(au.tobytes()); o.close()
os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
run("-f", "concat", "-safe", "0", "-i", "work/sel/lista.txt", "-i", "work/sel/audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", OUT)
run("-i", "work/sel/audio.wav", "-ac", "1", "-ar", "16000", "work/audio16k.wav")
json.dump(plan, open("work/plan_cortes.json", "w"), indent=1)
print(f"\n✓ {OUT}: {acc} fotogramas ({acc / FPS:.3f} s). Pon en spec.json: durationSec={acc / FPS:.3f}, video.segments=[[0,{acc / FPS:.3f}]]")
print("  Siguiente: transcribe work/audio16k.wav POR TRAMO (work/plan_cortes.json) para los subtítulos, y verifica que las frases enlazan.")
