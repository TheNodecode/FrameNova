# Colorización profesional (LOG, cámaras de cine, iPhone)

**Idea:** grabar plano (LOG) conserva luces y sombras; la colorización lo convierte a Rec.709 con un *look*. FrameNova hace esa conversión con las **curvas oficiales** de cada fabricante (S-Log3, V-Log, C-Log3, Apple Log) y aplica un look de cine encima.

## Qué cámara tengo → qué pongo
| Origen | `--camera` | Cómo grabar (resumen) |
|---|---|---|
| Sony FX3/FX30/FX6/A7S III/A7 IV/A1 (S-Log3, S-Gamut3.Cine) | `slog3` | 10 bit 4:2:2, perfil S-Log3. Expón el gris a ~41 % y la piel a ~55–60 IRE; evita subexponer (el ruido sube en sombras). |
| iPhone 15 Pro/16 Pro (Apple Log) | `applelog` | Ajustes › Cámara › Formatos › Captura de vídeo › Apple Log (según modelo/iOS: ProRes). Bloquea exposición y balance de blancos. |
| iPhone normal / Android | — (solo `look`) | Si sale lavado o quemado, desactiva "Vídeo HDR/Dolby Vision". Si ya es HDR, `prep-footage` lo detecta y lo pasa a SDR (tone-map). |
| Canon C70/R5 C/R6 II (C-Log3) | `clog3` | Cinema Gamut/C-Log3 10 bit. |
| Panasonic S5 II/GH6/BGH1 (V-Log) | `vlog` | V-Log/V-Gamut 10 bit. |
| Rec.709 ya corregido | — | usa `look` (natural/clean/cine/moody/punch). |

## Dos caminos (según lo que tenga instalado)
**A) Sin instalar nada (dentro de Remotion):**
```
python scripts/make-lut.py --camera slog3 --look cine --grade project/spec.json
```
Escribe la conversión como curvas por canal + saturación en `spec.json` (`grade`, `look:"grade"`) y Remotion la aplica a cada fotograma. Es una aproximación muy buena para planos normales (los tintes de sombras/luces se aplican por luminancia).

**B) Máxima fidelidad (ffmpeg completo):**
```
python scripts/make-lut.py --camera slog3 --look cine --out luts/slog3-cine.cube
node scripts/prep-footage.mjs --in clip.mov --lut luts/slog3-cine.cube
```
La LUT 3D se aplica **antes de escalar y de pasar a 8 bit**, con la mejor precisión (evita bandas en cielos y degradados). **Si el fabricante publica su LUT oficial (Sony, Apple, Canon, Panasonic), úsala con `--lut` en lugar de la nuestra**: están en sus webs de descargas y no las redistribuimos. La nuestra es una conversión técnica con hombro suave (gris 18 % → ≈ 0,40 en 709) más un look; la oficial conoce mejor el gamut de la cámara.

El script imprime una **comprobación**: el gris 18 % debe caer en ≈ 0,40–0,43 en Rec.709 (en S-Log3 el gris 18 % es el código 0,411; en V-Log 0,423; en Apple Log 0,488). Si no, algo va mal.

> Nota de precisión: las curvas de S-Log3, V-Log y C-Log3 están publicadas por los fabricantes. Las constantes de Apple Log provienen del documento técnico de Apple; si tienes su LUT oficial, compárala y usa la oficial.

## Looks
`neutral` (conversión limpia) · `clean` (brillo, contraste suave, publicitario) · `cine` (sombras azul-verdoso, luces cálidas, curva en S: el teal & orange sutil) · `moody` (más oscuro, desaturado: lujo/drama) · `punch` (contraste y saturación altos para redes). Ajuste de exposición: `--exposure +0.5` (pasos de diafragma).

## Buenas prácticas de grado
- **Piel primero:** ajusta hasta que la piel se vea natural y luego el look. Si el rostro se ve naranja, baja de `punch/cine` a `clean` o usa `--exposure -0.3`.
- **Un solo look por vídeo.** Las hojas a pantalla completa usan los colores de marca; el vídeo, el look.
- **Nitidez** (`sharpen` 0,25–0,45): compensa el escalado y la compresión de las redes. Más de 0,5 genera halos.
- No gradúes dos veces (LUT en prep + `look` fuerte en spec): si aplicaste LUT, deja `look:"natural"`.
- Ruido en sombras de LOG: `prep-footage --denoise` (ffmpeg completo) antes de colorizar.

## iPhone HDR (HLG / Dolby Vision) sin pasarse de brillo
Los iPhone graban HDR por defecto; visto como SDR sale quemado o apagado. `prep-footage` detecta `arib-std-b67` (HLG) y `smpte2084` (PQ) y aplica *tone-mapping* a Rec.709 (zscale + tonemap hable). Si las luces salen planas, baja `sharpen` y sube `--exposure`.
