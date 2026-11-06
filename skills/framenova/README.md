# FrameNova 🎬
*(antes llamada «Reel Studio»)*

**Un editor de vídeo profesional dentro de Claude.** Le das un vídeo en bruto y te devuelve un reel con cortes fluidos, color de cine, subtítulos modernos, motion graphics, música, efectos de sonido y cierre de marca, exportado en la máxima calidad para Instagram y TikTok, con su copy. Para cualquier sector: tecnología, IA, automatización, salud, lujo, creadores…

> "Edita este vídeo" → 10 preguntas rápidas → MP4 listo para subir.

## Instalar en 30 segundos
```bash
# 1) Descarga/descomprime esta carpeta y, dentro de ella:
node install.mjs
# 2) Reinicia Claude Code y pídele:
#    "Usa FrameNova para editar este vídeo: C:/videos/mi-video.mp4"
```
Otras opciones: `node install.mjs --project` (solo el proyecto actual) · `node install.mjs --dir <carpeta de skills de tu agente>` (Cursor, Codex, opencode…) · o copia la carpeta a mano a `~/.claude/skills/framenova`.

Requisitos: **Node.js 20+** (imprescindible). Opcional: ffmpeg completo (LUTs 3D, loudnorm, denoise), Python 3 + numpy (cortes de silencio y envolvente), `onnxruntime`+`pillow` (gráficos detrás de la persona). `node scripts/doctor.mjs` te dice qué tienes y qué comando instalar.

## Qué hace
| | |
|---|---|
| **Entrevista** | Claude te pregunta marca, colores, logo, sector, estilo/referencias, cámara, subtítulos, música, CTA y líneas rojas, y construye todo a tu medida. |
| **Estilos** | `apple-clean` · `ai-futurista` · `neo-tech` · `luxury` · `bold-creator` · `warm-human` — o pásale referencias y las traduce a tu marca. |
| **Corte** | Elimina silencios automáticamente (jump cuts fluidos) sin recodificar. |
| **Color** | Convierte LOG → Rec.709 con las curvas oficiales de **Sony S-Log3, Canon C-Log3, Panasonic V-Log, Apple Log (iPhone)**; looks de cine; tone-map de HDR del iPhone; LUT oficial si la tienes. |
| **Subtítulos** | Automáticos desde la voz (Whisper local): pastilla, karaoke, impacto o minimal; zonas para no tapar la cara. |
| **Motion graphics** | Palabras gigantes, ganchos, tablero de tarjetas de cristal, cifras que cuentan, **flujos de automatización**, **red neuronal**, **código que se escribe**, producto con brillo, transiciones tipo iOS. Detrás de la persona gracias al recorte. |
| **Audio** | Música con *ducking* (baja sola al hablar), caída sincronizada, 28 efectos de sonido sintetizados sin derechos, medidor de mezcla. |
| **Exportación** | H.264 High, bt709, crf 10, AAC 320k, nitidez; verificación automática (formato, sincronía, tirones). Guía para que Instagram/TikTok te quiten lo mínimo. |
| **Copy** | Gancho + intriga sin spoilers + CTA + 2 hashtags. |

## Cómo se usa (3 ejemplos de frase)
- *"Hazme un reel con este vídeo de mi iPhone en Apple Log, estilo Apple, con subtítulos y música. Mi marca es Acme (#0071E3)."*
- *"Tengo un vídeo explicando mi agente de IA: ponle motion graphics futuristas, corta los silencios y exporta para TikTok."*
- *"Reacciono a este vídeo viral en pantalla partida: subtítulos en el centro sin tapar a nadie y, cuando vuelvo a pantalla completa, efectos y música."*

## Estructura
```
SKILL.md          ← las instrucciones que sigue Claude (entrevista, flujo, reglas)
references/       ← estilos, componentes, color, audio, exportación, copy, sectores
scripts/          ← doctor, init-project, prep-footage, prepare, transcribe, silence-cuts, make-lut, matte, mix-advisor, render, verify-export…
template/         ← proyecto Remotion completo y probado (motor + kit + 6 estilos + 28 sonidos)
examples/         ← specs de ejemplo (explicador de IA, ranking, reacción)
```
Todo el vídeo se describe en **un archivo, `project/spec.json`** (el "panel de variables"): cambiar un tiempo, un texto o un efecto es editar una línea.

## Licencias y avisos (importante si lo compartes)
- **Remotion** (el motor de render) es gratis para particulares, empresas de hasta 3 personas y sin ánimo de lucro; **las empresas más grandes necesitan una licencia de Remotion** → https://remotion.pro. FrameNova solo lo usa, no lo incluye.
- Código de FrameNova y efectos de sonido (sintetizados) → MIT. Fuentes (Bricolage Grotesque, Inter Tight, Instrument Serif) → SIL OFL 1.1 (ver `NOTICE.md`).
- **No incluye música**: usa tu propia pista con licencia (o YouTube Audio Library, Pixabay, Uppbeat…). No incluye LUTs de fabricantes: usa las oficiales de Sony/Apple/Canon/Panasonic o genera las técnicas con `make-lut.py`.
- El modelo de recorte de personas (RobustVideoMatting, GPL-3.0) **no se incluye**: se descarga aparte y es opcional.
- Si reaccionas al vídeo de otra persona o usas su material, menciónala o pide permiso.
- Inspiración del proceso (puertas de control, plan antes de código, póster y copy como entregables): [`brag`](https://github.com/latent-spaces/brag) de latent-spaces (MIT).

## Qué NO hace (todavía)
Voz en off/TTS · subtítulos en idiomas con alfabeto no latino afinados · estabilización de imagen · multicámara · edición a partir de una URL. Consulta `references/troubleshooting.md`.
