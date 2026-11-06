#!/usr/bin/env python3
"""Verifica un vídeo exportado antes de subirlo: formato/códec/color, audio (nivel, saturación, sincronía con el original) y
fotogramas repetidos (tirones). Uso:
  python scripts/verify-export.py out/READY/mi-reel.mp4 [--original work/audio16k.wav] [--ffmpeg ffmpeg --ffprobe ffprobe]
Solo necesita numpy (y ffmpeg/ffprobe: los de Remotion sirven)."""
import glob, json, os, subprocess, sys, tempfile, wave
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np

a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
g = lambda n, d=None: a[a.index(n) + 1] if n in a else d
video = a[0]
ff, fp = g("--ffmpeg", "ffmpeg"), g("--ffprobe", "ffprobe")
bien = lambda c, t: print(("  OK  " if c else "  !!  ") + t)

p = json.loads(subprocess.run([fp, "-v", "error", "-show_entries", "stream=codec_type,codec_name,profile,width,height,r_frame_rate,pix_fmt,color_space,color_range,bit_rate,duration", "-of", "json", video], capture_output=True, text=True).stdout)
v = next(s for s in p["streams"] if s["codec_type"] == "video")
au = next((s for s in p["streams"] if s["codec_type"] == "audio"), None)
fps = eval(v["r_frame_rate"])
print(f"\n{video}\n  {v['width']}x{v['height']} @ {fps:.3f} fps  {v['codec_name']} {v.get('profile','')}  {v['pix_fmt']}  {v.get('color_space','?')}  {float(v['duration']):.1f} s")
bien(v["codec_name"] == "h264", "códec H.264 (compatible con todo)")
bien(v["pix_fmt"] == "yuv420p", "yuv420p (iPhone/Android/Instagram)")
bien(v.get("color_space") == "bt709", "bt709 (colores correctos; sin este dato se ven apagados en algunos móviles)")
bien((v["width"], v["height"]) in [(1080, 1920), (1080, 1080), (1080, 1350), (1920, 1080)], "resolución estándar de redes")
if au:
    bien(au["codec_name"] == "aac", f"audio AAC {int(au.get('bit_rate', 0)) // 1000} kbps")

tmp = tempfile.mkdtemp()
subprocess.run([ff, "-v", "error", "-i", video, "-an", "-vf", "scale=w=108:h=192", "-q:v", "3", os.path.join(tmp, "f%05d.jpg")], check=True)
try:
    from PIL import Image
    prev, rep = None, []
    for i, f in enumerate(sorted(glob.glob(os.path.join(tmp, "*.jpg")))):
        x = np.asarray(Image.open(f).convert("L"), np.float32)
        if prev is not None and np.abs(x - prev).mean() < 0.05:
            rep.append(round(i / fps, 1))
        prev = x
    bien(not rep, f"sin fotogramas repetidos{'' if not rep else ' → en s: ' + str(rep[:12])}")
except ImportError:
    print("  ..  (instala pillow para comprobar fotogramas repetidos: pip install pillow)")

wav = os.path.join(tmp, "a.wav")
subprocess.run([ff, "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
with wave.open(wav) as w:
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
sat = int((np.abs(x) >= 0.999).sum())
bien(sat < 50, f"audio: pico {np.abs(x).max():.2f}, {sat} muestras saturadas")
orig = g("--original")
if orig and os.path.exists(orig):
    with wave.open(orig) as w:
        o = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    seg = o[16000 * 2:16000 * 8]
    mejor = (-1, 0)
    for lag in range(-300, 301, 2):
        t = x[16000 * 2 + lag:16000 * 8 + lag]
        if len(t) == len(seg):
            c = np.corrcoef(seg, t)[0, 1]
            if c > mejor[0]:
                mejor = (c, lag)
    bien(abs(mejor[1]) <= 16, f"sincronía de la voz con el original: {mejor[1] / 16:.1f} ms (corr {mejor[0]:.2f})")
print()
