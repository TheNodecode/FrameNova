#!/usr/bin/env python3
"""Envolvente de volumen de la voz (project/envelope.json) para el DUCKING de música y efectos, y medida del nivel de la voz.
Uso: python scripts/envelope.py work/audio16k.wav [--out project/envelope.json] [--cuts project/segments.json]
Solo necesita numpy. La voz original no se modifica."""
import json, sys, wave
sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
import numpy as np

def leer(p):
    with wave.open(p) as w:
        sr = w.getframerate(); ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch > 1: x = x.reshape(-1, ch).mean(axis=1)
    return x, sr

def main():
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    out = a[a.index("--out") + 1] if "--out" in a else "project/envelope.json"
    x, sr = leer(a[0])
    if "--cuts" in a:  # aplicar cortes: concatena solo los tramos que se quedan
        segs = json.load(open(a[a.index("--cuts") + 1]))
        x = np.concatenate([x[int(s * sr):int(e * sr)] for s, e in segs])
    hz = 20
    paso = sr // hz; n = len(x) // paso
    r = np.sqrt((x[: n * paso].reshape(n, paso) ** 2).mean(axis=1))
    r = np.sqrt(r)
    r = np.clip(r / max(np.percentile(r, 96), 1e-9), 0, 1)
    json.dump({"hz": hz, "values": [round(float(v), 2) for v in r]}, open(out, "w"))
    voz = x[np.abs(x) > 0.01]
    rms = float(np.sqrt((voz ** 2).mean())) if len(voz) else 0.0
    print(f"envolvente: {n} valores a {hz} Hz → {out}")
    print(f"nivel de la voz (rms al hablar): {rms:.3f}  ({20*np.log10(rms+1e-9):.1f} dBFS)")
    print("→ pásalo a scripts/mix-advisor.py para fijar music.gain y sfxGain")

main()
