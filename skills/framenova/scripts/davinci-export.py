#!/usr/bin/env python3
"""
DAVINCI RESOLVE (también la versión GRATIS). Resolve gratis NO se controla desde fuera (la API externa es de Studio);
sí ejecuta scripts desde su menú. Este script deja en out/davinci/:
  - cortes.edl      → los cortes de work/plan_cortes.json sobre el vídeo ORIGINAL (para reabrir el montaje en Resolve)
  - subtitulos.srt  → los subtítulos de project/words.json (tiempo de salida)
  - look.cube       → LUT 33³ equivalente al look del spec (para el nodo de color)
  - montar-corte.lua → script para Resolve: Espacio de trabajo > Scripts > Edit (cópialo a
       %APPDATA%\\Blackmagic Design\\DaVinci Resolve\\Support\\Fusion\\Scripts\\Edit  ·  macOS: ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Edit)

Uso: python scripts/davinci-export.py --original "C:/ruta/original.mp4" [--tc 01:00:00:00] [--look pro]
  --tc = timecode inicial del original (míralo con ffprobe: TAG:timecode). Si el vídeo salió de Resolve suele ser 01:00:00:00.
"""
import json, os, sys
import numpy as np


def arg(n, d=None):
    a = sys.argv
    return a[a.index("--" + n) + 1] if "--" + n in a else d


ORIG = arg("original")
if not ORIG:
    sys.exit(__doc__)
OUT = "out/davinci"; os.makedirs(OUT, exist_ok=True)
base = 24  # timecode nominal para 23,976 / 24 (no drop-frame)
h, m, s, f = map(int, arg("tc", "00:00:00:00").split(":"))
TC0 = ((h * 60 + m) * 60 + s) * base + f
tc = lambda x: f"{x // (base * 3600):02d}:{(x // (base * 60)) % 60:02d}:{(x // base) % 60:02d}:{x % base:02d}"

plan = json.load(open("work/plan_cortes.json"))
L, rec = ["TITLE: FrameNova", "FCM: NON-DROP FRAME", ""], 86400
for k, p in enumerate(plan, 1):
    L += [f"{k:03d}  AX       AA/V  C        {tc(p['sf'] + TC0)} {tc(p['sf'] + p['n'] + TC0)} {tc(rec)} {tc(rec + p['n'])}",
          f"* FROM CLIP NAME: {os.path.basename(ORIG)}", f"* {p['idea']}", ""]
    rec += p["n"]
open(f"{OUT}/cortes.edl", "w", encoding="utf-8", newline="\r\n").write("\n".join(L))

W = json.load(open("project/words.json", encoding="utf-8"))
lines, cur = [], []
for w in W:
    if cur and (len(" ".join(x["text"] for x in cur + [w])) > 32 or w["t0"] - cur[-1]["t1"] > 0.45):
        lines.append(cur); cur = []
    cur.append(w)
    if w["text"][-1:] in ".?!":
        lines.append(cur); cur = []
if cur:
    lines.append(cur)
st = lambda t: f"{int(t * 1000) // 3600000:02d}:{(int(t * 1000) // 60000) % 60:02d}:{(int(t * 1000) // 1000) % 60:02d},{int(t * 1000) % 1000:03d}"
srt = []
for i, l in enumerate(lines):
    b = lines[i + 1][0]["t0"] - 0.02 if i + 1 < len(lines) else l[-1]["t1"] + 0.4
    srt.append(f"{i + 1}\n{st(l[0]['t0'])} --> {st(b)}\n{' '.join(x['text'] for x in l)}\n")
open(f"{OUT}/subtitulos.srt", "w", encoding="utf-8").write("\n".join(srt))

LOOKS = {  # mismas tablas que kit/Media.tsx
    "pro": ([[0, .22, .52, .83, 1], [0, .22, .5, .81, .99], [.02, .22, .47, .77, .96]], 1.12),
    "cine": ([[0, .2, .5, .82, 1], [0, .23, .5, .8, .98], [.05, .27, .5, .75, .93]], 1.06),
    "punch": ([[0, .2, .52, .86, 1]] * 3, 1.25),
    "clean": ([[0, .3, .58, .84, 1], [0, .3, .58, .84, 1], [.01, .31, .58, .83, .99]], 0.94),
}
T, sat = LOOKS[arg("look", "pro")]
M = np.array([[.213 + .787 * sat, .715 - .715 * sat, .072 - .072 * sat], [.213 - .213 * sat, .715 + .285 * sat, .072 - .072 * sat], [.213 - .213 * sat, .715 - .715 * sat, .072 + .928 * sat]])
N, C = 33, [f'TITLE "FrameNova {arg("look", "pro")}"', "LUT_3D_SIZE 33", ""]
for bb in range(N):
    for g in range(N):
        for r in range(N):
            v = np.clip(M @ np.array([np.interp(x / (N - 1), np.linspace(0, 1, 5), T[c]) for c, x in enumerate((r, g, bb))]), 0, 1)
            C.append(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}")
open(f"{OUT}/look.cube", "w").write("\n".join(C) + "\n")

carpeta = os.path.abspath(OUT).replace("\\", "\\\\")
lua = open(os.path.join(os.path.dirname(__file__), "davinci-montar-corte.lua"), encoding="utf-8").read()
lua = lua.replace("__CARPETA__", os.path.abspath(OUT) + os.sep).replace("__ORIGINAL__", os.path.abspath(ORIG))
open(f"{OUT}/montar-corte.lua", "w", encoding="utf-8").write(lua)
print(f"✓ {OUT}: cortes.edl ({len(plan)} cortes), subtitulos.srt ({len(lines)}), look.cube, montar-corte.lua")
