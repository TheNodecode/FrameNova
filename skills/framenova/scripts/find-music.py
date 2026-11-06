#!/usr/bin/env python3
"""
MÚSICA CON LICENCIA desde Openverse (api.openverse.org, sin clave): busca, descarga y analiza (BPM, caídas, si parece
instrumental) para elegir la pista y alinear su caída con el momento clave del vídeo.

Uso:
  python scripts/find-music.py --q "hip hop,cinematic,electronic" [--n 8]          # lista candidatos (uso comercial)
  python scripts/find-music.py --get <id> [--drop-at 9.55] [--len 75]              # descarga, analiza y recorta
     → public/audio/music.wav ya recortada para que la caída caiga en --drop-at (segundo del vídeo) + work/music-CREDITS.txt

Licencias: se filtra a uso comercial y modificable. Prefiere CC BY o CC0 (CC BY-SA obliga a compartir igual la obra
derivada). SIEMPRE pon el crédito que imprime el script en la descripción del vídeo. No escuchas la música: si tienes
`earshot` (github.com/Leonxlnx/earshot) puedes ordenar candidatos con `earshot rank`; si no, pide al usuario que la oiga.
"""
import glob, json, os, subprocess, sys, urllib.parse, urllib.request, wave
import numpy as np


def arg(n, d=None):
    a = sys.argv
    return a[a.index("--" + n) + 1] if "--" + n in a else d


FF = arg("ffmpeg") or (glob.glob("node_modules/@remotion/compositor-*/ffmpeg*") or ["ffmpeg"])[0]
API = "https://api.openverse.org/v1/audio/"
os.makedirs("work/music", exist_ok=True)
get = lambda u: json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "framenova"}), timeout=30).read())

if arg("q"):
    vistos = {}
    for q in arg("q").split(","):
        p = urllib.parse.urlencode({"q": q.strip(), "license_type": "commercial,modification", "category": "music", "page_size": arg("n", "8")})
        for r in get(f"{API}?{p}").get("results", []):
            vistos[r["id"]] = r
    for r in vistos.values():
        print(f"{r['id']} | {round((r.get('duration') or 0) / 1000)}s | {r['license']} {r.get('license_version')} | {r['title'][:40]} | {r.get('creator')}")
    json.dump(vistos, open("work/music/candidatos.json", "w", encoding="utf-8"), ensure_ascii=False)
    sys.exit(0)

if arg("get"):
    r = get(f"{API}{arg('get')}/")
    mp3 = f"work/music/{r['id'][:8]}.mp3"
    urllib.request.urlretrieve(r["url"], mp3)
    subprocess.run([FF, "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", "22050", mp3[:-4] + ".wav"], check=True)
    w = wave.open(mp3[:-4] + ".wav"); sr = w.getframerate()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    e = np.array([np.sqrt((a[i:i + sr // 10] ** 2).mean()) for i in range(0, len(a) - sr // 10, sr // 10)])  # 0,1 s
    # caída = mayor salto de energía media (1 s antes vs 1 s después)
    salto = [(e[i:i + 10].mean() - e[i - 10:i].mean(), i / 10) for i in range(10, len(e) - 10)]
    caida = max(salto)[1]
    S = np.abs(np.fft.rfft(a[: sr * 30])) ** 2; fr = np.fft.rfftfreq(len(a[: sr * 30]), 1 / sr)
    voz = S[(fr > 300) & (fr < 3400)].sum() / S.sum()
    print(f"caída principal ≈ {caida:.1f} s · banda vocal {voz:.0%} ({'probablemente instrumental' if voz < 0.12 else 'puede tener voz'})")
    if arg("drop-at"):
        ini = max(0.0, caida - float(arg("drop-at")))
        largo = float(arg("len", 75))
        os.makedirs("public/audio", exist_ok=True)
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{ini:.3f}", "-t", f"{largo:.3f}", "-i", mp3, "-ac", "2", "-ar", "48000",
                        "-af", "volume=1", "public/audio/music.wav"], check=True)
        print(f"✓ public/audio/music.wav desde {ini:.2f} s (caída en el segundo {arg('drop-at')} del vídeo). Pon music.dropAt y mide con mix-advisor.py")
    cred = f"Música: \"{r['title']}\" de {r.get('creator')} — {r['license'].upper()} {r.get('license_version')} — {r.get('foreign_landing_url')}"
    open("work/music-CREDITS.txt", "w", encoding="utf-8").write(cred + "\n")
    print(cred)
    sys.exit(0)
print(__doc__)
