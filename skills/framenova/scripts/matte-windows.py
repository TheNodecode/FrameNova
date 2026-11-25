# Recorta a la persona (RobustVideoMatting) SOLO en unas ventanas de tiempo del montaje, para poner texto "dentro de la escena"
# (detrás de la persona). Guarda public/matte/mNNNN.png (RGBA: blanco con alfa) con NNNN = fotograma del montaje.
# Uso: python matte_ventanas.py <ffmpeg> <video> <rvm.onnx> <carpeta_salida> "ini-fin,ini-fin,..." (segundos del montaje)
import subprocess, sys, os, glob, shutil, tempfile, json
import numpy as np
import onnxruntime as ort
from PIL import Image

ff, video, modelo, salida, ventanas = sys.argv[1:6]
FPS = 24000 / 1001
W, H, w, h = 1920, 1080, 960, 540
os.makedirs(salida, exist_ok=True)
ses = ort.InferenceSession(modelo, providers=["CPUExecutionProvider"])
ratio = np.array([0.5], np.float32)
info = {}
for vi in ventanas.split(','):
    a, b = [float(x) for x in vi.split('-')]
    first = round(a * FPS)
    n_fr = round((b - a) * FPS)
    tmp = tempfile.mkdtemp()
    subprocess.run([ff, '-v', 'error', '-ss', f'{first / FPS:.6f}', '-i', video, '-frames:v', str(n_fr), '-an', '-vf', f'scale=w={w}:h={h}', '-q:v', '2', os.path.join(tmp, 'f%05d.jpg')], check=True)
    estado = [np.zeros((1, 1, 1, 1), np.float32) for _ in range(4)]
    tops = []
    for k, ruta in enumerate(sorted(glob.glob(os.path.join(tmp, '*.jpg')))):
        src = (np.asarray(Image.open(ruta).convert('RGB'), dtype=np.float32) / 255).transpose(2, 0, 1)[None]
        _, pha, *estado = ses.run(None, {'src': src, 'r1i': estado[0], 'r2i': estado[1], 'r3i': estado[2], 'r4i': estado[3], 'downsample_ratio': ratio})
        al = np.clip(pha[0, 0], 0, 1)
        al = np.clip((al - 0.06) / 0.88, 0, 1)
        filas = np.where((al > 0.5).sum(1) > 8)[0]
        if len(filas): tops.append(filas[0] / h)
        A = Image.fromarray((al * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
        rgba = np.dstack([np.full((H, W, 3), 255, np.uint8), np.asarray(A)])
        Image.fromarray(rgba, 'RGBA').save(os.path.join(salida, f'm{first + k:04d}.png'), compress_level=3)
    shutil.rmtree(tmp, ignore_errors=True)
    info[vi] = {'first': first, 'frames': n_fr, 'head_top': float(np.median(tops)) if tops else None}
    print(vi, info[vi], flush=True)
json.dump(info, open(os.path.join(salida, '..', 'matte_info.json'), 'w'))
