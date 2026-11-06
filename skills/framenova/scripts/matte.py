#!/usr/bin/env python3
"""Recorte de la persona fotograma a fotograma (RobustVideoMatting, ONNX en CPU) para poner gráficos DETRÁS de ella.
Uso: python scripts/matte.py --video public/video/main.mp4 --out public/matte --ffmpeg ffmpeg [--model models/rvm.onnx] [--w 1080 --h 1920]
Requiere:  pip install onnxruntime pillow numpy   y el modelo rvm_mobilenetv3_fp32.onnx
           (https://github.com/PeterL1n/RobustVideoMatting/releases/tag/v1.0.0). Tarda ~2-5 min por minuto de vídeo.
Genera m0000.png... (RGBA, solo cuenta el alfa) y escribe "matte": {"dir","max"} en project/spec.json."""
import glob, json, os, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding="utf-8")
import numpy as np
import onnxruntime as ort
from PIL import Image

a = sys.argv[1:]
g = lambda n, d=None: a[a.index(n) + 1] if n in a else d
video, out, ff = g("--video", "public/video/main.mp4"), g("--out", "public/matte"), g("--ffmpeg", "ffmpeg")
modelo, W, H = g("--model", "models/rvm.onnx"), int(g("--w", 1080)), int(g("--h", 1920))
if not os.path.exists(modelo):
    sys.exit(f"Falta el modelo {modelo}. Descárgalo (ver cabecera de este script).")
os.makedirs(out, exist_ok=True)
ses = ort.InferenceSession(modelo, providers=["CPUExecutionProvider"])
estado = [np.zeros((1, 1, 1, 1), np.float32) for _ in range(4)]
ratio = np.array([0.3], np.float32)
tmp = tempfile.mkdtemp()
subprocess.run([ff, "-v", "error", "-i", video, "-an", "-vf", f"scale=w={W}:h={H}", "-q:v", "1", os.path.join(tmp, "f%05d.jpg")], check=True)
n = 0
for ruta in sorted(glob.glob(os.path.join(tmp, "*.jpg"))):
    src = (np.asarray(Image.open(ruta).convert("RGB"), dtype=np.float32) / 255).transpose(2, 0, 1)[None]
    _, pha, *estado = ses.run(None, {"src": src, "r1i": estado[0], "r2i": estado[1], "r3i": estado[2], "r4i": estado[3], "downsample_ratio": ratio})
    al = np.clip((np.clip(pha[0, 0], 0, 1) - 0.06) / 0.88, 0, 1)
    Image.fromarray(np.dstack([np.full((H, W, 3), 255, np.uint8), (al * 255).astype(np.uint8)]), "RGBA").save(os.path.join(out, f"m{n:04d}.png"), compress_level=3)
    n += 1
shutil.rmtree(tmp, ignore_errors=True)
p = "project/spec.json"
sp = json.load(open(p, encoding="utf-8"))
sp["matte"] = {"dir": os.path.relpath(out, "public").replace("\\", "/"), "max": n - 1}
json.dump(sp, open(p, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(f"{n} recortes en {out} (spec.matte actualizado)")
