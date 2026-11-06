#!/usr/bin/env python3
"""Analiza una pista de música: duración, BPM aproximado y la "CAIDA" (el salto de energía) para sincronizarla con el
momento clave del vídeo. Uso: python scripts/music-analyze.py pista.wav|mp3 [--ffmpeg ffmpeg]
Solo necesita numpy (si es mp3 usa ffmpeg para convertir)."""
import os, subprocess, sys, tempfile, wave
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np

a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
ff = a[a.index("--ffmpeg") + 1] if "--ffmpeg" in a else "ffmpeg"
src = a[0]
if not src.lower().endswith(".wav"):
    tmp = os.path.join(tempfile.mkdtemp(), "m.wav")
    subprocess.run([ff, "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "22050", tmp], check=True)
    src = tmp
with wave.open(src) as w:
    sr = w.getframerate()
    ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
if ch > 1:
    x = x.reshape(-1, ch).mean(axis=1)
dur = len(x) / sr
h = sr // 2
e = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h, h)])  # energía cada 0,5 s
salto = np.diff(np.convolve(e, np.ones(4) / 4, mode="same"))
cand = np.argsort(salto)[::-1][:5]
hop = 512
fr = np.array([np.sqrt((x[i:i + 1024] ** 2).mean()) for i in range(0, len(x) - 1024, hop)])
on = np.maximum(0, np.diff(fr))
on /= on.max() + 1e-9
ac = np.correlate(on, on, "full")[len(on) - 1:]
lag = np.arange(len(ac)) * hop / sr
sel = (lag > 0.3) & (lag < 1.0)
bpm = 60 / lag[np.argmax(np.where(sel, ac, -1))]
print(f"duración: {dur:.1f} s   BPM ≈ {bpm:.0f}   rms global: {np.sqrt((x ** 2).mean()):.3f}")
print("caídas candidatas (segundo de la pista, mayor salto de energía primero):")
for i in cand:
    print(f"  {(i + 1) * 0.5:6.1f} s   energía {e[max(0, i - 2)]:.2f} -> {e[min(len(e) - 1, i + 3)]:.2f}")
print("Para que la caída coincida con el segundo T del vídeo: recorta la pista desde (caída - T) con scripts/cut-music.mjs")
