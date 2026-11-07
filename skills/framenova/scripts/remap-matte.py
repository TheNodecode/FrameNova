# Reutiliza el recorte ya calculado cuando solo cambian los cortes: cada fotograma nuevo toma la máscara del
# fotograma viejo que viene del mismo instante del original (plan_cortes_v4.json -> plan_cortes.json).
import json, os, shutil
FPS = 24000 / 1001
M = '../../proyectos/claude-editor/public/matte'
old = json.load(open('plan_cortes_v4.json')); new = json.load(open('plan_cortes.json'))
tmp = M + '_nuevo'; os.makedirs(tmp, exist_ok=True)
k = 0; falta = 0
for p in new:
    for j in range(p['n']):
        sf = p['sf'] + j
        o = next((q for q in old if q['sf'] <= sf < q['sf'] + q['n']), None)
        if o is None: falta += 1; o = old[-1]; sf = o['sf'] + o['n'] - 1
        oi = round(o['out0'] * FPS) + (sf - o['sf'])
        shutil.copyfile(f'{M}/m{oi:04d}.png', f'{tmp}/m{k:04d}.png'); k += 1
shutil.rmtree(M); os.rename(tmp, M)
print('fotogramas', k, 'sin origen', falta)
