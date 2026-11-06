# Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Render falla con "No frame found at position" | El vídeo es HEVC 10 bits (iPhone/Sony) y el compositor de Remotion no lo busca bien | `node scripts/prep-footage.mjs --in original.mov` (genera H.264) |
| Los colores salen apagados en el móvil | Falta etiquetar bt709 / vídeo HDR | `prep-footage` etiqueta bt709 y hace tone-map HDR→SDR; verifica con `verify-export.py` |
| Voz y vídeo desfasados tras sustituir el audio | Cebado AAC de 42,7 ms | `ffmpeg … -ss 0.0427 -i audio.aac …` (ver `audio.md`) |
| La música tapa la voz / no se oye | Nivel absoluto igual para voces distintas | `mix-advisor.py` y ajusta `music.gain` y `sfxGain`; no uses `trimBefore` en `<Audio>` |
| Subtítulos sobre la cara | Altura fija para todo el vídeo | `subtitles.zones` por tramo; mide la coronilla con el recorte; o cápsula en la costura |
| Gráficos delante de la cara | No hay recorte | `python scripts/matte.py` (gráficos detrás) o recoloca a zonas libres |
| El gancho "3" se queda mucho | `hook.to` largo | `to - from ≤ 1.5` |
| Tirones | fps duplicado o render con otros procesos | Mantén el fps de origen; un solo render a la vez; `verify-export.py` |
| `npm run dev` va lento | 3D/recorte pesado en Studio | La vista previa va a tirones; lo que vale es el render. Usa `stills.mjs` |
| `ffmpeg` no encontrado | No instalado | `node scripts/doctor.mjs` te da el comando; sin él funciona todo menos LUT 3D/denoise/loudnorm de calidad |
| Whisper tarda en la 1.ª vez | Descarga el modelo (≈1,5 GB `medium`) | Usa `--model small` para pruebas |
| Nombres con tilde fallan en rutas | Algunas herramientas no los manejan | Copia el vídeo a un nombre sin tildes |
| Fuentes distintas a las del preset | Fuentes no cargadas | `cargarFuentes()` en `theme.ts`; los .ttf están en `public/fonts` |
