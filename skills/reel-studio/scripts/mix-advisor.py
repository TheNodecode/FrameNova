#!/usr/bin/env python3
"""Sugiere los niveles de mezcla (music.gain y sfxGain) para que la música quede ~ -14 dB bajo la voz.
Uso: python scripts/mix-advisor.py work/audio16k.wav pista.wav [--target -14]
Mide el rms de la voz mientras habla y el rms de la música. La voz de cada vídeo es distinta (un móvil puede sonar 14 dB más bajo
que un micro de solapa): NO uses el mismo nivel para todos."""
import sys, wave
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np


def rms(p, solo_voz=False):
    with wave.open(p) as w:
        ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    if solo_voz:
        x = x[np.abs(x) > 0.01]
    return float(np.sqrt((x ** 2).mean())) if len(x) else 1e-6


a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
obj = float(a[a.index("--target") + 1]) if "--target" in a else -14.0
v, m = rms(a[0], True), rms(a[1])
duck_medio = 0.6  # la música baja ~40 % de media mientras hablan
gain = min(1.0, (v * 10 ** (obj / 20)) / (m * duck_medio))
sfx = min(1.0, 0.8 * v / 0.27)  # los efectos están normalizados para una voz con rms ~ 0,27
print(f"voz rms {v:.3f} ({20 * np.log10(v):.1f} dBFS)   música rms {m:.3f}")
print(f'-> en spec.json:  "music": {{ ..., "gain": {gain:.2f} }},  "sfxGain": {sfx:.2f}')
if v < 0.1:
    print("AVISO: la voz suena baja (< 0,1 rms). No la tocamos; si quieres más volumen, normaliza el audio en tu editor o usa --loudnorm en prep-footage.")
