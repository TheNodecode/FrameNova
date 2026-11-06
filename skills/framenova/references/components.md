# Catálogo de componentes (spec.json)

Todos los tiempos en **segundos del vídeo de salida**. `color` ∈ `ok|warn|bad|accent|accent2` (siempre del tema).

## layers (van detrás de la persona si hay recorte; si no, sobre el vídeo)
- `giantWord` — `{type, text, from, to, y=800, size=220, dir=±1, color}`: palabra a contorno que deriva y recorta los bordes. 1 por producto/concepto nombrado.
- `hook` — `{type, text, from, to, y=330, size=1250}`: número/palabra gigante que entra al instante y se va en **≤ 1,5 s** (no lo dejes más: tapa y satura). Con rayos de luz.
- `burst` — `{type, at}`: 3 anillos + 3 rayos. Úsalo en la caída de la música o en el cambio de fase.
- `chip` — `{type, text, from, to, x=540, y, color}`: etiqueta de cristal con punto de color.
- `stat` — `{type, from, to, y=262, value, prefix, suffix, label, decimals}`: cifra que cuenta.
- `cards` — `{type, from, to, y=250, items:[{n, title, tag, tagColor, note, image, at}]}`: tablero de 2–4 tarjetas. La última revelada se ensancha. `image` = PNG con fondo transparente (sale por arriba de la tarjeta).

## sheets (pantalla completa; la persona retrocede y se atenúa)
`{from, to, transition: "sube"|"iris"|"izq"|"dcha"|"persiana", background?, scene}`; la entrada dura 0,5 s y la salida 0,45 s. **Alterna transiciones y fondos, ≤ 6 s por hoja.** En `scene`, los `at` son segundos desde que entra la hoja:
- `title` `{kicker, title, accentWord, lines[]}` — titular editorial con palabra en serif de acento.
- `stat` `{kicker, value, suffix, prefix, label, bars[0..1]}` — cifra enorme + barras que crecen.
- `flow` `{kicker, title, nodes:[{label, sub, at}]}` — **flujo de automatización**: nodos que se encienden, cables que se llenan y pulsos que viajan. Ideal para n8n/Make/Zapier/IA.
- `list` `{kicker, title, items:[{text, at}]}` — lista con ✓ que se dibuja.
- `code` `{kicker, title, lines[], file}` — ventana de terminal/editor con tipeo y resaltado.
- `neural` `{kicker, title}` — red neuronal con señales (IA).
- `image` `{kicker, src, caption}` — foto de producto con brillo que la recorre.

## subtitles
`{enabled, style: pill|karaoke|impact|minimal, y, maxChars=22, emphasis:[palabras], lines:[[texto,from,to]], zones:[{from,to,y,capsule}]}`
- Salen **solos** de `project/words.json` (Whisper). `emphasis` fuerza qué palabras van en color; si no, elige la más larga de cada línea y las cifras.
- `zones` cambia la altura por tramo (sobre el regazo, arriba…) y `capsule:true` mete la línea en una cápsula de cristal (pantalla partida: `y` = costura).
- `lines` sustituye la transcripción automática por texto escrito a mano (`*palabra*` marca el énfasis).

## video / matte / look
- `video: {src, segments:[[ini,fin]], muted, zoom}` — `segments` = cortes (jump cuts) en tiempo ORIGINAL; `zoom: 0` apaga zoom/cámara en mano (pantalla partida), `1` es lo normal.
- `matte: {dir, max}` — recorte de la persona (scripts/matte.py). Activa "gráficos detrás".
- `look` y `sharpen` (0–1, defecto 0.35): colorización rápida y nitidez. `grade`: conversión LOG→709 generada por `make-lut.py --grade`.

## audio
- `music: {src, gain, duck=0.62, fadeIn, fadeOut, dropAt}` — `dropAt` = segundo de salida en que cae la música (hace un hundimiento previo).
- `sfx: [{f, t, v}]`, `sfxGain` — nombres en `public/sfx` (ver `audio.md`).
- `punches: [segundos]` — golpe de zoom que se asienta (en cortes, golpes de voz, caída).

## closing
`{at, seconds, tagline}` — círculo que revela logo (o nombre) + lema + @.
