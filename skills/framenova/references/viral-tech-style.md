# Estilo "viral tech" (reels de "edito con IA") · cómo se monta

Probado en un reel real de 74 s a partir de 12 min de grabación (estilo de referencias tipo "Claude just killed it").

## Las piezas (kit/Pantalla.tsx, todas en `spec.layers`)
| Capa | Qué es | Cuándo |
|---|---|---|
| `headline` `{lines:["YA NO PAGO","*EDITORES*"]}` | Rótulo fijo arriba, condensado (Bricolage wdth 75), contorno negro, `*palabra*` en acento. Se oculta solo en los fogonazos. | Todo el vídeo; cambia en el CTA ("COMENTA / *SKILL*"). |
| `monitor` `{kicker,title,ui}` | Pantalla inclinada en 3D sobre rejilla, el titular se escribe con cursor; `ui`: `timeline`, `flujo`, `carpetas`, `codigo`, `chat`. Tapa a la persona. | Cada PASO o concepto, 3–5 s. |
| `slam` `{text}` | Fogonazo a pantalla completa del acento con palabra gigante oscura (tamaño automático). | La palabra clave: nombre del producto, "REFERENCIAS", el CTA. ≤1 s. Alinéalo con la caída de la música. |
| `chrome` `{text,y,size}` | Palabra metálica con brillo DETRÁS de la persona (necesita `matte`). y≈760 para que asome por encima de la cabeza. | Refuerza la palabra que se dice, 1,5–2 s. |
| `clips` `{items:[{src,at,label,dur}]}` | Tarjetas flotantes con clips (public/clips, sin audio) que entran en abanico, con etiqueta blanca; oscurece y desenfoca el fondo. | "He visto a muchos creadores…" (clips de otros, 1,8–2 s cada uno) y "vídeos como estos" (tus trabajos). |
| `chip`, `hook`, `burst` | Del kit base. | Apoyos. |

Subtítulos: `style:"lux"` (frase en Inter Tight + palabra clave en serif cursiva con degradado del acento; cada palabra sale de un desenfoque) o `karaoke`. Ponlos bajo la cara (y≈1540) y con `emphasis` = palabras clave reales.

Estilos listos: `claude-tech` (grafito + naranja) y `nova-gold` (negro + oro). Look de color `pro` = retoque suave para material YA colorizado.

## Ritmo que funciona
- Algo cambia cada 1,5–2,5 s. Patrón: persona → monitor (paso) → persona con palabra cromada → fogonazo → persona…
- Gancho: rótulo fijo desde el fotograma 0 + clips de otros creadores en tarjetas mientras dice "he visto a muchos…".
- La caída de la música coincide con el primer `slam` (≈ segundo 8–10).
- Sonidos: `reverse-swell` + `whoosh-up` en el segundo 0; un whoosh/swipe distinto por tarjeta; `riser` 1,2 s antes de cada slam y `impact` en el slam; `pop` en chips; `sub-drop` en palabras cromadas.

## Grabaciones largas con repeticiones
`scripts/select-takes.py` (ver cabecera): transcribe por tomas (no el audio entero), elige la mejor toma de cada idea, ajusta bordes a las pausas y monta `selects.mp4` exacto al fotograma. Después transcribe el extracto POR TRAMO y estira las palabras al inicio/fin real de la voz de cada tramo (Whisper adelanta ~0,5 s).

## Limpieza (moscas, motas)
`kit/Parche.tsx` superpone parches RGBA con bordes suaves en fotogramas concretos del original (`public/parche/parche.json` + `pNNN.png`). Se generan con un script de numpy: rellenar la mota con la media gaussiana de la pared alrededor, solo dentro de la zona de pared (cierre morfológico), y comprobar en una hoja antes/después.

## Música y efectos
- `scripts/find-music.py`: Openverse (sin clave), filtrado a uso comercial; analiza BPM, caída y si parece instrumental; recorta para que la caída caiga en `--drop-at`. Prefiere CC BY / CC0 y pon el crédito.
- Para "escuchar" audio: `earshot` (github.com/Leonxlnx/earshot, MIT, CPU, ~1,1 GB de modelos): `earshot describe`, `earshot rank`. Opcional; si no está, pide al usuario que escuche.
- Efectos: la biblioteca `public/sfx` (sintetizada, sin derechos). Para más, sonidos CC0 de Openverse (`category=sound_effect`).

## DaVinci Resolve gratis
No se controla desde fuera (la API externa es de Studio). `scripts/davinci-export.py` deja EDL (cortes sobre el original, ojo al timecode inicial), SRT, LUT .cube del look y un script Lua para Espacio de trabajo > Scripts > Edit.

## Derechos (díselo al usuario)
- Clips de otros creadores: muy cortos, como cita/comentario; mejor mencionarlos o pedir permiso.
- Trabajos para clientes: confirma que el cliente acepta que se usen como portafolio.
- Música: crédito obligatorio en CC BY.
