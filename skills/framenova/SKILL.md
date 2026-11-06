---
name: framenova
description: Motor de edición de vídeo cinematográfico con IA para reels, TikToks, Shorts y anuncios. Convierte un vídeo en bruto (iPhone, Sony S-Log3, Canon C-Log, Apple Log, webcam…) en un vídeo profesional: cortes fluidos de silencios, colorización/LOG→Rec.709, subtítulos modernos automáticos, motion graphics para cualquier sector (tecnología, IA, automatización, futurista, salud, lujo, creadores…), música con ducking, efectos de sonido, cierre con marca, exportación de máxima calidad para Instagram/TikTok y copy. Construido sobre Remotion. ÚSALA cuando el usuario diga "edita este vídeo", "hazme un reel", "añade subtítulos/motion graphics", "colorízalo", "quiero un vídeo estilo Apple/futurista", "prepara esto para Instagram/TikTok" o pase un vídeo para mejorar. Use when the user wants a raw video turned into a polished social video with subtitles, motion graphics, color grading, music and export.
---

# FrameNova · el editor de vídeo dentro de Claude

**Promesa:** el usuario entrega un vídeo y dice, en pocas palabras, qué quiere. Tú le haces las preguntas justas, montas todo con Remotion y le devuelves un MP4 listo para subir (+ portada + copy), con calidad de estudio. Sin abrir un editor.

Todo vive en esta carpeta de skill:
- `template/` — proyecto Remotion completo y probado (motor + kit de animación + 6 estilos).
- `scripts/` — preparación del material, transcripción, cortes, LUTs, audio, render y verificación.
- `references/` — guías de diseño, color, audio, exportación, copy y sectores. **Léelas cuando toque ese tema.**
- `examples/` — `spec.json` de ejemplo (reacción, ranking, explicador de IA…).

## 0 · Antes de nada: comprueba el equipo (30 s)

```
node <skill>/scripts/doctor.mjs
```
Imprescindible: Node ≥ 20. Opcionales: ffmpeg completo (LUTs de cámara, loudnorm, denoise), Python+numpy (cortes y envolvente de voz), onnxruntime+pillow (poner gráficos DETRÁS de la persona). Si falta algo, el propio script dice el comando exacto. **No sigas sin Node.**

## 1 · ENTREVISTA (una sola vez, en un solo mensaje)

No empieces a montar sin esto. Haz las preguntas juntas, numeradas, con una respuesta por defecto sugerida para cada una, y di que puede contestar en una línea ("todo por defecto" vale). Si el usuario ya contestó algo, no lo repitas.

1. **Vídeo(s):** ruta del archivo. ¿De qué trata y qué quieres conseguir (educar, vender, viralizar, marca personal)?
2. **Dónde se publica y formato:** Reels/TikTok/Shorts vertical 9:16 *(defecto)* · cuadrado · 4:5 · horizontal.
3. **Marca:** nombre, @usuario, logo (PNG transparente: ruta), colores (hex) o "invéntalos", tipografía si tiene.
4. **Sector y estilo:** elige uno (mira `references/styles.md`) o **pásame referencias** (capturas, vídeos, enlaces) y las traduzco a tu estilo:
   `apple-clean` · `ai-futurista` · `neo-tech` · `luxury` · `bold-creator` · `warm-human` · `claude-tech` · `nova-gold`.
   Para reels tipo "edito con IA" (pantalla inclinada, fogonazos, palabras cromadas, tarjetas con clips) lee `references/viral-tech-style.md`.
5. **Cámara / formato de origen:** iPhone normal · iPhone Apple Log · Sony S-Log3 (FX3/A7S III/FX30…) · Canon C-Log3 · Panasonic V-Log · Rec.709 ya corregido · no sé. *(define la colorización: `references/color-grading.md`)*
6. **Subtítulos:** estilo (`pill` · `karaoke` · `impact` · `minimal`), idioma, ¿corto los silencios (jump cuts)?
7. **Música:** ¿tienes pista con licencia? ¿ambiente (épica, tech, chill, lujo)? Si no, el vídeo va sin música y te digo dónde conseguirla libre de derechos.
8. **Qué tiene que aparecer:** productos en mano, cifras, pasos, herramientas, CTA final (guardar / seguir / enlace).
9. **Líneas rojas:** palabras o promesas prohibidas (legal/sector), cosas que no quiera tapar (cara, producto, pantalla).
10. **Tono:** serio · cercano · humor · trailer/épico.

**Si hay referencias:** extrae de ellas paleta, tipografía (peso, serif/sans), densidad, ritmo de cortes, tipo de transición y tipo de fondo; elige el preset más cercano y escribe lo que difiera en `brand.json → overrides`. Dile al usuario en una frase qué has entendido de su referencia.

## 2 · Crea el proyecto

```
node <skill>/scripts/init-project.mjs --dir ./mi-reel --name "Marca" --preset ai-futurista --accent "#7C5CFF" --accent2 "#22D3EE" --logo ./logo.png --tagline "…" --handle "@marca" --format vertical --fps 30
cd mi-reel && npm install
```
Esto copia `template/` (con los scripts dentro) y escribe `brand.json` con sus respuestas. Desde aquí trabajas **dentro de la carpeta del proyecto**.

## 3 · Prepara el material

```
node scripts/prep-footage.mjs --in "C:/ruta/video.mov" --format vertical [--lut luts/slog3-cine.cube] [--loudnorm]
node scripts/prepare.mjs --lang es [--cut]
```
- `prep-footage` conforma a formato, convierte a H.264 (Remotion no lee bien HEVC 10 bits), aplica LUT si hay ffmpeg completo y saca el audio. **El audio original no se toca** salvo `--loudnorm` si el usuario lo pide.
- `prepare` transcribe con Whisper local (word-level), calcula los cortes de silencio, genera la envolvente de voz y deja `project/spec.json` listo (formato, duración, vídeo). Con `--cut` aplica los jump cuts.
- **Color de cámara LOG:** mira `references/color-grading.md` ya. Camino sin ffmpeg completo: `python scripts/make-lut.py --camera slog3 --look cine --grade project/spec.json`.
- **Persona recortada** (para gráficos DETRÁS de ella, el efecto "caro"): `python scripts/matte.py` (necesita onnxruntime + el modelo RVM; ver cabecera). Opcional pero muy recomendable en planos medios.
- **Grabación larga con repeticiones** (el usuario "lo grabó todo de largo"): `python scripts/select-takes.py --video … --cuts work/cuts.json` (lee su cabecera: transcribir POR TOMAS, cortar en pausas, verificar el extracto).
- **Música con licencia:** `python scripts/find-music.py --q "hip hop,cinematic"` y `--get <id> --drop-at <segundo>`. **DaVinci Resolve (gratis):** `python scripts/davinci-export.py --original … --tc 01:00:00:00` (EDL + SRT + LUT + script Lua).
- **Si el vídeo es una reacción o pantalla partida:** detecta el corte entre fases (diferencia entre fotogramas) y usa `subtitles.zones` con `capsule:true` en la costura. Ver `examples/reaction-split.spec.json`.

## 4 · STORYBOARD antes de tocar el spec (puerta de control)

Escribe `work/plan.md` (no lo muestres entero; resúmelo en 5 líneas al usuario) con:
- **Hook (0–2 s):** qué se ve y se oye en el primer fotograma (nunca empieces con "hola"). Rótulo/palabra gigante desde el frame 0.
- **Estructura:** hook → promesa → 3-5 beats → CTA. Cada beat = una idea = un gráfico distinto.
- **Tabla de tiempos** por beat: segundo de entrada (de la transcripción), capa/hoja, sonido, golpe de cámara.
- **Zonas libres:** dónde está la cara/manos/producto en cada plano (mide con el recorte o con capturas) y dónde van los subtítulos.
- **Música:** dónde cae la caída y qué momento marca.

**Puerta:** no pases a montar hasta poder responder: ¿qué cambia en pantalla cada 1,5–3 s? ¿qué gráfico explica cada idea? ¿nada tapa la cara/producto?

## 5 · Monta (solo `project/spec.json`, casi nunca código)

El spec es el panel de variables. Tiempos de capas/hojas/sonidos en **segundos del vídeo de salida**. Resumen (detalle en `references/components.md`):

| Quieres… | Pones en `spec.json` |
|---|---|
| Palabra gigante a contorno detrás de la persona | `layers: {type:"giantWord", text, from, to, y, color}` |
| Número/palabra de gancho 1 s | `{type:"hook", text:"3", from:0, to:1.4}` |
| Estallido de luz (con la caída de la música) | `{type:"burst", at}` |
| Tablero de tarjetas (ranking, pasos, features) | `{type:"cards", items:[{title,tag,tagColor,note,image,at}]}` |
| Cifra que cuenta / etiqueta | `{type:"stat",…}` · `{type:"chip",…}` |
| Pantalla completa que explica | `sheets: {from,to,transition, scene:{type:"flow"|"stat"|"list"|"code"|"neural"|"title"|"image"}}` |
| Subtítulos automáticos | `subtitles:{enabled,style,y,maxChars,emphasis,zones}` (salen de la transcripción) |
| Zoom/golpes de cámara | `punches:[segundos]` (y `video.zoom: 0` para no mover nada) |
| Música + efectos | `music:{src,gain,duck,dropAt}`, `sfx:[{f,t,v}]`, `sfxGain` |
| Look de color | `look: "natural"|"clean"|"cine"|"moody"|"punch"|"grade"` |
| Cierre con marca | `closing:{at,seconds,tagline}` |

Para algo que el kit no cubre, **añade un componente** en `src/kit/` (mismo estilo: `theme`, `useT`, resortes) y enchúfalo en `Reel.tsx`. Nunca copies colores a mano: usa `theme.*`.

**Revisa fotogramas, no confíes:** `node scripts/stills.mjs --at 0.4,2,5.5,9 --scale 0.4` (UNA llamada con todos los segundos) y mira la hoja de contacto. Corrige y repite. Comprueba `npm run check` (tsc).

## 6 · Mezcla y render

```
python scripts/mix-advisor.py work/audio16k.wav public/audio/music.wav     # sugiere music.gain y sfxGain
node scripts/render.mjs --name "mi-reel" --poster 1.2
python scripts/verify-export.py out/READY/mi-reel.mp4 --original work/audio16k.wav
```
- **La voz de cada vídeo tiene un nivel distinto.** Mide siempre (mix-advisor). Objetivo: música ≈ −14 dB bajo la voz (≈ −17 dB en las partes sin gráficos).
- Pista de música: recórtala con `cut-music.mjs` desde `(caída − segundo_del_momento_clave)`; `music-analyze.py` encuentra la caída y los BPM. **Nunca uses `trimBefore` en `<Audio>` con función de volumen.**
- Render: ~30–40 min por 50 s en un portátil. Lanza en segundo plano y no tengas dos a la vez. Para cambiar solo el audio: `--audio-only` y remuxa (instrucciones en la salida).
- **Verifica antes de entregar:** H.264, yuv420p, bt709, sin fotogramas repetidos, sin saturación, voz sincronizada (0 ms). Y mira capturas del vídeo FINAL.

## 7 · Entrega
Un mensaje corto: ruta del MP4 en `out/READY/`, portada, **copy** (ver `references/copy.md`: 3–5 líneas, gancho + intriga sin spoilers + CTA, máx. 2 hashtags), lo que NO has podido comprobar (el sonido no se oye desde aquí: pídele que lo escuche) y las afirmaciones del contenido que debería confirmar con quien corresponda. Consejos de subida: `references/export-quality.md`.

## Reglas de oro (no negociables)
1. **No toques la imagen ni el audio originales** salvo lo que el usuario pida (color, cortes, loudnorm). Solo AÑADES capas.
2. **La cara y lo que enseña son sagrados.** Subtítulos, tarjetas y gráficos nunca encima: usa zonas libres, el recorte (gráficos detrás) o la costura.
3. **Algo cambia cada 1,5–3 s** y el hook pasa en los primeros 2 s. Los gráficos largos (hojas) ≤ 6 s y alternados con la persona en pantalla.
4. **Una idea = un gráfico distinto.** Nada de repetir la misma tarjeta; nada de clipart/emojis; volumen, brillo y sombra.
5. **Sé específico, no genérico.** Usa las palabras reales del vídeo y datos del usuario ("Show the thing"). Prohibido el relleno tipo "Revoluciona tu flujo de trabajo".
6. **Calidad de entrega:** H.264 High crf 10, bt709, yuv420p, AAC 320k, resolución nativa (1080×1920), sin recomprimir dos veces, nitidez suave. Verifica siempre.
7. **Honestidad:** di lo que no pudiste comprobar y avisa de claims de salud/finanzas/legales o de contenido de terceros (derechos).
8. **Una cosa a la vez:** itera con stills baratos; el render completo solo cuando el usuario (o tú) estéis seguros.

## Si algo falla
- *"No frame found" en el render* → el vídeo es HEVC 10 bits: pásalo por `prep-footage`.
- *Subtítulos desalineados con cortes* → todo en tiempo de salida; `words.json` va en tiempo original y se convierte solo.
- *Fuentes raras* → `cargarFuentes()` en `theme.ts`; las fuentes están en `public/fonts`.
- *Audio retrasado tras remux* → falta `-ss 0.0427` (cebado AAC).
- Más: `references/troubleshooting.md`.

*Inspiración de proceso (puertas de control, plan antes de código, póster y copy como entregables, presets de tono): proyecto `brag` de latent-spaces (MIT). Este motor, sus componentes y su sistema de estilos son propios.*
