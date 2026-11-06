#!/usr/bin/env python3
"""Cortes automáticos de silencios ("jump cuts" fluidos). Devuelve los tramos que SE QUEDAN (en segundos del original).
Uso: python scripts/silence-cuts.py work/audio16k.wav [--min-silence 0.45] [--pad 0.12] [--thresh -38] [--apply]
  --min-silence  silencio mínimo para cortar (s)      --pad  aire que se deja antes/después de cada frase (s)
  --thresh       umbral en dB respecto al pico de voz  --apply  escribe los tramos en project/spec.json (video.segments)
Solo necesita numpy. Es un cálculo (no recodifica el vídeo): Remotion aplica los cortes al renderizar."""
import json, sys, wave
sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
import numpy as np

a = sys.argv[1:]
if not a: sys.exit(__doc__)
opt = lambda n, d: float(a[a.index(n) + 1]) if n in a else d
with wave.open(a[0]) as w:
    sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
if ch > 1: x = x.reshape(-1, ch).mean(axis=1)
dur = len(x) / sr
ventana = int(sr * 0.02)
n = len(x) // ventana
rms = np.sqrt((x[: n * ventana].reshape(n, ventana) ** 2).mean(axis=1))
pico = np.percentile(rms, 98)
voz = rms > pico * 10 ** (opt("--thresh", -38) / 20) if pico > 0 else np.zeros(n, bool)
# rellenar huecos cortos (< min-silence) y quitar chasquidos (< 0.12 s)
minsil = int(opt("--min-silence", 0.45) / 0.02); pad = opt("--pad", 0.12)
tr = []; ini = None
for i, v in enumerate(voz):
    if v and ini is None: ini = i
    if not v and ini is not None: tr.append([ini, i]); ini = None
if ini is not None: tr.append([ini, n])
uni = []
for s, e in tr:
    if uni and s - uni[-1][1] < minsil: uni[-1][1] = e
    else: uni.append([s, e])
uni = [[s, e] for s, e in uni if (e - s) * 0.02 > 0.12]
segs = []
for s, e in uni:
    s2 = max(0.0, s * 0.02 - pad); e2 = min(dur, e * 0.02 + pad)
    if segs and s2 <= segs[-1][1]: segs[-1][1] = e2
    else: segs.append([round(s2, 2), round(e2, 2)])
quedan = sum(e - s for s, e in segs)
print(json.dumps(segs))
print(f"# original {dur:.1f} s → queda {quedan:.1f} s ({100*quedan/dur:.0f} %), {len(segs)} tramos, se cortan {dur-quedan:.1f} s de silencio", file=sys.stderr)
if "--apply" in a:
    p = "project/spec.json"; sp = json.load(open(p, encoding="utf-8"))
    sp["video"] = sp.get("video") or {"src": "video/main.mp4"}
    sp["video"]["segments"] = segs
    cl = sp.get("closing") or {}
    if cl: cl["at"] = round(quedan, 2)
    sp["durationSec"] = round(quedan + cl.get("seconds", 0), 2)
    json.dump(sp, open(p, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print("# aplicado en project/spec.json (video.segments y durationSec)", file=sys.stderr)
