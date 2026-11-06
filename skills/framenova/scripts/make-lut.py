#!/usr/bin/env python3
"""Genera LUTs .cube (33x33x33) de LOG -> Rec.709 con look, para colorizar vídeo de cámara de cine o iPhone en LOG.
Uso:  python scripts/make-lut.py --camera slog3 --look cine --out luts/slog3-cine.cube
      --camera: slog3 (Sony FX3/FX6/A7S III/A7 IV/FX30), vlog (Panasonic), clog3 (Canon), applelog (iPhone 15 Pro+), rec709 (solo look)
      --look:   neutral | clean | cine | moody | punch          --exposure: ajuste en pasos de diafragma (ej. +0.5)
      --grade project/spec.json   (alternativa SIN ffmpeg completo) escribe la conversión como filtro de color dentro de spec.json
                                  ("grade") y pone "look": "grade": Remotion la aplica al renderizar.
Aplica la curva OFICIAL de cada fabricante (log -> luz lineal), añade un tono de pantalla (hombro suave) y el look.
Es una conversión técnica excelente para empezar; si el fabricante publica su LUT oficial, úsala con --lut en prep-footage.
Solo necesita numpy."""
import sys
import numpy as np
sys.stdout.reconfigure(encoding="utf-8")

# ---- log -> lineal (entrada 0..1 = código normalizado) --------------------------------------------------------------
def slog3(x):
    return np.where(x >= 171.2102946929 / 1023.0, 10 ** ((x * 1023.0 - 420.0) / 261.5) * (0.18 + 0.01) - 0.01,
                    (x * 1023.0 - 95.0) * 0.01125000 / (171.2102946929 - 95.0))

def vlog(x):
    return np.where(x < 0.181, (x - 0.125) / 5.6, 10 ** ((x - 0.598206) / 0.241514) - 0.00873)

def clog3(x):  # Canon C-Log3 (constantes publicadas por Canon)
    return np.where(x < 0.097465473, -(10 ** ((0.12783901 - x) / 0.36726845) - 1) / 14.98325,
                    np.where(x <= 0.15277891, (x - 0.12512219) / 1.9754798, (10 ** ((x - 0.12240537) / 0.36726845) - 1) / 14.98325))

def applelog(x):  # Apple Log Profile (iPhone 15 Pro+). Constantes del white paper de Apple; verifica con su LUT oficial si puedes.
    R0, Rt, c, b, g, d = -0.05641088, 0.01, 47.28711236, 0.00964052, 0.08550479, 0.69336945
    Pt = c * (Rt - R0) ** 2
    return np.where(x >= Pt, 2 ** ((x - d) / g) - b, np.sqrt(np.maximum(x, 0) / c) + R0)

CURVAS = {"slog3": slog3, "vlog": vlog, "clog3": clog3, "applelog": applelog, "rec709": lambda x: x ** 2.4}

# ---- tono de pantalla + look -----------------------------------------------------------------------------------------
def filmico(l):
    """Hombro suave (Reinhard extendido) para que las luces no se quemen: mapea gris 18 % a ~0.18."""
    blanco = 6.0
    l = l * 1.17  # compensa el hombro: el gris 18 % queda en ~0.41 (como en una conversión 709 estándar)
    return l * (1 + l / (blanco * blanco)) / (1 + l)

def oetf709(l):
    l = np.clip(l, 0, 1)
    return np.where(l < 0.018, 4.5 * l, 1.099 * l ** 0.45 - 0.099)

def curva_s(v, k):
    return v + k * (v - 0.5) * (1 - np.abs(2 * v - 1)) * 0.5

LOOKS = {
    "neutral": dict(s=0.00, sat=1.00, tinte_sombra=(0, 0, 0), tinte_luz=(0, 0, 0)),
    "clean":   dict(s=0.25, sat=1.05, tinte_sombra=(0, 0.00, 0.01), tinte_luz=(0.01, 0.01, 0.0)),
    "cine":    dict(s=0.55, sat=1.08, tinte_sombra=(-0.02, 0.01, 0.045), tinte_luz=(0.045, 0.02, -0.03)),   # sombras azul-verdoso, luces cálidas
    "moody":   dict(s=0.70, sat=0.85, tinte_sombra=(-0.015, 0.005, 0.03), tinte_luz=(0.02, 0.01, -0.01)),
    "punch":   dict(s=0.80, sat=1.28, tinte_sombra=(0, 0, 0.02), tinte_luz=(0.02, 0.01, 0)),
}

def aplicar(rgb, camara, look, exposicion):
    l = CURVAS[camara](rgb) * (2 ** exposicion)
    l = np.maximum(l, 0)
    v = oetf709(filmico(l)) if camara != "rec709" else rgb
    p = LOOKS[look]
    v = curva_s(v, p["s"])
    lum = (v * np.array([0.2126, 0.7152, 0.0722])).sum(axis=-1, keepdims=True)
    v = lum + (v - lum) * p["sat"]
    sombra = np.clip(1 - lum * 2, 0, 1); luz = np.clip(lum * 2 - 1, 0, 1)
    v = v + sombra * np.array(p["tinte_sombra"]) + luz * np.array(p["tinte_luz"])
    return np.clip(v, 0, 1)

def main():
    a = sys.argv[1:]
    if not a or "-h" in a: sys.exit(__doc__)
    g = lambda n, d: a[a.index(n) + 1] if n in a else d
    camara, look, out, exp = g("--camera", "slog3"), g("--look", "cine"), g("--out", "luts/out.cube"), float(g("--exposure", 0))
    if camara not in CURVAS or look not in LOOKS: sys.exit(f"camera ∈ {list(CURVAS)}, look ∈ {list(LOOKS)}")
    if "--grade" in a:
        escribir_grade(a[a.index("--grade") + 1], camara, look, exp)
        return
    N = 33
    ax = np.linspace(0, 1, N)
    B, G, R = np.meshgrid(ax, ax, ax, indexing="ij")  # el .cube varía primero R, luego G, luego B
    rgb = np.stack([R, G, B], axis=-1).reshape(-1, 3)
    res = aplicar(rgb, camara, look, exp)
    with open(out, "w", encoding="utf-8") as f:
        f.write(f'TITLE "{camara}-{look}"\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for r, gg, b in res: f.write(f"{r:.6f} {gg:.6f} {b:.6f}\n")
    cod = codigo_gris(camara)
    gris = float(aplicar(np.array([[cod] * 3]), camara, "neutral", 0)[0, 0])
    print(f"LUT escrita: {out}  ({camara} -> Rec.709, look {look}, exposición {exp:+.1f} EV)")
    print(f"comprobación: gris 18 % = código log {cod:.3f} -> Rec.709 {gris:.3f}  (esperado ≈ 0.40-0.43)")

def escribir_grade(ruta, camara, look, exp):
    """Aproxima el LUT con 3 curvas 1D (una por canal, sobre el eje gris) + saturación: se aplica con un filtro SVG en Remotion."""
    import json
    n = 129
    x = np.linspace(0, 1, n)
    gris = np.stack([x, x, x], axis=-1)
    y = aplicar(gris, camara, look, exp)
    sp = json.load(open(ruta, encoding="utf-8"))
    sp["grade"] = {"r": [round(float(v), 4) for v in y[:, 0]], "g": [round(float(v), 4) for v in y[:, 1]], "b": [round(float(v), 4) for v in y[:, 2]], "sat": LOOKS[look]["sat"]}
    sp["look"] = "grade"
    json.dump(sp, open(ruta, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"grade escrito en {ruta}: {camara} -> Rec.709, look {look}, exposición {exp:+.1f} EV (look=grade)")

def codigo_gris(camara):
    """Código log que la curva oficial convierte en luz lineal 18 % (bisección)."""
    lo, hi = 0.0, 1.0
    for _ in range(60):
        m = (lo + hi) / 2
        if float(CURVAS[camara](np.array(m))) < 0.18: lo = m
        else: hi = m
    return (lo + hi) / 2

main()
