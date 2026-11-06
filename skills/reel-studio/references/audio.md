# Audio: voz, música y efectos

## Principios
- **La voz original no se toca.** Música y efectos bajan solos mientras hablan (ducking con `project/envelope.json`, generada por `scripts/envelope.py`).
- **Mide la voz de cada vídeo** (`mix-advisor.py`): un móvil puede sonar 14 dB más bajo que un micro de solapa. Objetivo: música ≈ −14 dB bajo la voz (≈ −17 dB en tramos sin gráficos), efectos ligeramente por encima de la música pero nunca tapando palabras.
- Si la voz queda baja (rms < 0,1) no la subas a escondidas: avisa y ofrece `prep-footage --loudnorm` (−16 LUFS).

## Música
- **No incluimos música** (derechos). Pídele al usuario una pista con licencia, o sugiere fuentes libres: YouTube Audio Library, Pixabay Music, Uppbeat, Epidemic/Artlist si tiene suscripción. Respeta la atribución si la licencia la exige.
- Sincroniza la **caída** con el momento clave: `music-analyze.py pista.mp3` devuelve BPM y la caída; `cut-music.mjs --start (caída − segundo_clave)` recorta la pista y `music.dropAt` en el spec hace un hundimiento previo (riser) para que el golpe suene más. Durante intros suaves, preamplifica la introducción (`--boost-intro 2 --boost-until 12`).
- Fundido de entrada 0,9 s y de salida 1,6 s. Nunca uses `trimBefore` en `<Audio>` con función de volumen: el fotograma llega desplazado y descuadra el ducking.
- Géneros: IA/futurista → electrónica oscura o ambient con pulso; neo-tech → synth/techno minimal; lujo → piano/cinemático lento; creador → hip-hop/phonk bajo; salud/humano → lo-fi o acústico luminoso.

## Efectos de sonido incluidos (`public/sfx`, sintetizados: sin derechos)
`impact`, `impact-soft`, `boom-soft`, `sub-drop` (golpe grave), `whoosh-up`, `whoosh-down`, `whoosh-up-big`, `whoosh-down-big`, `swipe`, `riser`, `reverse-swell`, `tension`, `descend`, `land`, `scan`, `pop-1`, `pop-2`, `pop-3`, `poof`, `drop`, `bubbles`, `crackle`, `heartbeat`, `breath`, `rise`, `clock-tick`, `save`, `send`.
Reglas: **un sonido propio por evento visual**, rota entre variantes (`pop-1/2/3`), sin repetir el mismo dos veces seguidas, y sin timbres/campanitas (suenan a plantilla). Golpe grave en titulares y caídas, whoosh en hojas y golpes de zoom, pop al aparecer elementos pequeños, `save`/`send` en CTAs.

## Mezcla final
`python scripts/verify-export.py out/READY/x.mp4 --original work/audio16k.wav` → pico, saturación y sincronía. Unas pocas muestras en el límite (picos de voz + música) son inaudibles; si hay cientos, baja `music.gain`.

## Sincronía tras remuxar solo el audio
El AAC suelto trae 42,7 ms de cebado: `ffmpeg -i video.mp4 -ss 0.0427 -i audio.aac -map 0:v -map 1:a -c copy -movflags +faststart final.mp4`.
