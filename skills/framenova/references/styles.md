# Estilos (presets) y cómo crear el tuyo "tipo Apple"

Un estilo = un bloque de **tokens** en `template/src/theme.ts` (colores, tipografías, vidrio, fondo, subtítulos, look de color). Todo el kit lee esos tokens, así que **cambiar de estilo = cambiar una línea** (`brand.json → preset`) y afinarlo con `accent`, `accent2` y `overrides`.

| Preset | Sensación | Fondo | Subtítulos | Look | Para |
|---|---|---|---|---|---|
| `apple-clean` | blanco roto, tinta casi negra, un solo acento azul, mucho aire | studio (luz suave + bokeh) | pill | clean | producto premium, software, educación elegante, finanzas, marcas personales sobrias |
| `ai-futurista` | negro azulado + aurora violeta/cian, vidrio oscuro con brillo | aurora | pill | cine | IA, startups, SaaS, automatización, "futuro", lanzamientos |
| `neo-tech` | grafito + rejilla en perspectiva + azul eléctrico y lima | grid | karaoke | punch | dev tools, ciberseguridad, no-code/automatización (n8n, Make, Zapier), datos |
| `luxury` | negro + oro, serif grande, contraste alto | mesh | minimal | moody | inmobiliaria de lujo, joyería, moda, hostelería, coaches premium |
| `bold-creator` | amarillo-negro, palabras gigantes de una en una | mesh | impact | punch | creadores, e-commerce, fitness, retos, contenido viral |
| `claude-tech` | grafito + naranja, pantalla inclinada sobre rejilla, palabras condensadas | grid | karaoke | pro | reels de IA/edición/automatización ("edito con Claude") |
| `nova-gold` | negro + oro, fogonazos dorados, subtítulos serif cursiva | grid | lux | pro | SaaS premium, marca personal de lujo, agencias |
| `warm-human` | crema + rosa, cristal claro, cercano | studio | pill | natural | salud, clínicas, bienestar, educación, servicios locales |

## Las 10 reglas que dan el aspecto "caro/Apple"
1. **Un acento, no cinco.** Dos colores de marca como máximo (`accent`, `accent2`); verdes/rojos/ámbar solo en píldoras de veredicto pequeñas.
2. **Contraste de escala:** línea pequeña en mayúsculas con tracking abierto + palabra gigante. Es el sello tipográfico.
3. **Una o dos familias:** una grotesca pesada (titulares) + una serif cursiva para la palabra clave. Nunca tres.
4. **Tinta, no negro puro:** `#1D1D1F` sobre claro; blanco `#F4F6FF` sobre oscuro. Sombras suaves y largas, no duras.
5. **Cristal con propósito:** `backdrop-filter: blur`, borde de 1,5 px translúcido, brillo superior interior y un barrido de luz lento.
6. **Movimiento con resorte y poco rebote** (`resorte(t, t0, 150, 13)`); curvas de salida suaves; nada lineal; nada que tiemble.
7. **Aire:** márgenes ≥ 90 px, no llenes el cuadro; una idea por plano.
8. **Profundidad:** gráficos detrás de la persona (recorte), partículas lentas, viñeta mínima. Nunca fondos planos muertos.
9. **Consistencia:** mismo radio, misma sombra, mismas curvas en TODO el vídeo.
10. **Restricción:** si dudas entre añadir y quitar, quita.

## Crear un estilo nuevo desde una referencia
1. Mira la referencia y anota: ¿claro u oscuro? ¿color de acento? ¿serif/sans y qué peso? ¿bordes redondos o rectos? ¿cristal, plano o brutalista? ¿fondo animado (aurora, rejilla, nada)? ¿ritmo (cortes rápidos, planos largos)?
2. Elige el preset más cercano y escribe las diferencias en `brand.json → overrides` (p. ej. `{"bg":"#0B1020","radius":16,"subs":"karaoke"}`) o copia el bloque en `PRESETS` con otro nombre.
3. Cambia SOLO tokens; si hace falta un fondo nuevo, añade una variante en `kit/Background.tsx` (`FondoTipo`).
4. Comprueba con `stills.mjs` en 3 planos: gancho, tarjetas, hoja. Si los tres se leen como la misma marca, está.

## Colores: cómo elegir sin ser diseñador
- Dame el hex de marca → es `accent`. `accent2` = vecino análogo más claro (o complementario muy suave).
- Fondo oscuro: `bg` = el acento oscurecido al 4–6 % de luminosidad (nunca #000).
- Fondo claro: `bg` casi blanco con un toque del acento; `bg2` un paso más saturado.
- Comprueba contraste del texto de subtítulos sobre vídeo: sombra de 3 capas ya incluida.
