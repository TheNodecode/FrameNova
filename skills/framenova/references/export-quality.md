# Exportar con la máxima calidad y que Instagram/TikTok no la destrocen

**La verdad incómoda:** ninguna red sube tu archivo tal cual; todas lo **recomprimen** (Instagram a unos 3–5 Mbps). No se puede evitar. Lo que SÍ se controla es el material de partida y el camino de subida.

## Receta de exportación (la que usa `render.mjs`)
H.264 **High**, `yuv420p`, `bt709` (etiquetado), PNG como intermedio, **crf 10**, preset `slow`, AAC **320 k / 48 kHz**, `+faststart`, resolución nativa **1080×1920** (o 1080×1350 / 1080×1080), fps = el del material (23,976/25/30; no dupliques fotogramas para "llegar a 30": mete tirones). Sale a ~20–25 Mbps. Subir de 35 Mbps no mejora lo que ve la red.
- `bt709` etiquetado evita colores apagados en algunos móviles; `yuv420p` es lo único que aceptan todos.
- Evita HEVC/ProRes como entrega: las redes lo convierten de todas formas y a veces mal.

## Qué hace que se vea mejor DESPUÉS de la recompresión
1. **Resolución exacta** 1080×1920: si subes más, la red reescala (blando); si subes menos, amplía.
2. **Nitidez suave** (ya incluida, `sharpen`) y zoom contenido (≤ 1,1×): ampliar un vídeo de 1080 lo ablanda.
3. **Detalle limpio:** evita grano artificial y degradados enormes casi planos (se rompen en bandas); si hace falta un fondo liso, añade partículas o una textura muy sutil.
4. **Texto grande y con sombra** (≥ 56 px en 1080): los subtítulos finos se pierden al comprimir.
5. **Mínimo de recompresiones:** edita desde el original y exporta UNA vez. Si pasas el archivo por WhatsApp/Telegram se destruye.

## Camino de subida (lo que más cambia)
- **Instagram (móvil):** Ajustes › Uso de datos y calidad del contenido multimedia › **Subir en la mejor calidad**. Sin eso la app comprime antes de subir.
- **Desde el ordenador:** Meta Business Suite / Creator Studio / la web de TikTok comprimen menos que el móvil.
- Pasa el archivo al móvil por **cable, AirDrop o Drive**, nunca por mensajería.
- No metas filtros, recortes ni música desde la app (fuerzan otra recompresión). Pon la música ANTES, en el propio vídeo.
- Zona segura: nada importante en los 250 px de arriba, 340 de abajo ni 90 de los lados (interfaz de la app).
- Portada: `render.mjs --poster <seg>` saca un fotograma limpio; súbela como portada del reel.

## Antes de entregar: `verify-export.py`
Comprueba códec, píxel, color, resolución, saturación del audio, **sincronía** de la voz con el original y fotogramas repetidos. Si algo sale "!!", corrígelo antes de decir "listo".

## Tiempos orientativos (portátil sin GPU)
Recorte de persona 2–5 min por minuto de vídeo · transcripción ~1–2 min · render 30–40 min por 50 s · solo audio ~3 min.
