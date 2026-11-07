#!/usr/bin/env python3
"""
APRETAR CORTES (quitar pausas). Lee work/cortes.json ([{src:[ini,fin], idea}], segundos del original) y el audio
del original a 16 kHz, y para cada corte lista:
  - el inicio/fin real de la voz (para dejar solo ~0,05 s antes y ~0,12 s después)
  - las pausas internas > --maxp (0,30 s por defecto) candidatas a quitarse (deja 0,12 s de aire)
y escribe work/cortes_apretados.json con los tramos propuestos (mismo formato que cortes.json).

OJO (probado en un reel real): las palabras suaves ("la clave", "y si aún") quedan por debajo del umbral y el
cálculo automático las corta. Por eso: bordes con umbral bajo, pausas con umbral alto, y REVISA la propuesta contra
las palabras de Whisper por corte antes de montar. También mira repeticiones entre cortes (p. ej. un corte acaba
en "Remotion" y el siguiente empieza "Remotion es…": empieza el segundo después de la palabra repetida).

Uso: python scripts/tighten-cuts.py [--cuts work/cortes.json] [--audio work/audio16k.wav] [--maxp 0.30]
"""
import json, sys, wave
import numpy as np


def arg(n, d):
    a = sys.argv
    return a[a.index('--' + n) + 1] if '--' + n in a else d


FPS = 24000 / 1001
PRE, POST, KEEP = 0.05, 0.12, 0.12
MAXP = float(arg('maxp', 0.30))
C = json.load(open(arg('cuts', 'work/cortes.json')))
w = wave.open(arg('audio', 'work/audio16k.wav')); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
h = sr // 100
out = []
for c in C:
    s0, s1 = c['src']
    seg = a[int(s0 * sr):int(s1 * sr)]
    r = np.array([np.sqrt((seg[k:k + h] ** 2).mean()) for k in range(0, len(seg) - h, h)])
    p90 = np.percentile(r, 90)
    idx = np.where(r >= max(0.012, p90 * 0.07))[0]          # bordes: umbral bajo (no comerse palabras suaves)
    if not len(idx): continue
    v = r >= max(0.012, p90 * 0.2)                             # pausas: umbral alto
    on, off = idx[0] / 100, (idx[-1] + 1) / 100
    sil, k = [], idx[0]
    while k <= idx[-1]:
        if not v[k]:
            e = k
            while e < len(v) and not v[e]: e += 1
            if (e - k) / 100 > MAXP: sil.append((k / 100, e / 100))
            k = e
        else: k += 1
    pts = [max(0, on - PRE)] + [x for s, e in sil for x in (s + KEEP / 2, e - KEEP / 2)] + [min(s1 - s0, off + POST)]
    print(f"{c.get('idea', '')}: voz {s0 + on:.2f}-{s0 + off:.2f}  pausas {[(round(s0 + x, 2), round(s0 + y, 2)) for x, y in sil]}")
    for j in range(0, len(pts), 2):
        A, B = round((s0 + pts[j]) * FPS) / FPS, round((s0 + pts[j + 1]) * FPS) / FPS
        if B - A > 0.1: out.append({'src': [round(A, 3), round(B, 3)], 'idea': c.get('idea', '')})
acc = 0
for o in out: o['out'] = round(acc, 3); acc += o['src'][1] - o['src'][0]
json.dump(out, open('work/cortes_apretados.json', 'w'), indent=1)
print(f"{len(out)} tramos, {acc:.2f} s → work/cortes_apretados.json (revísalo antes de montar)")
