# Guías por sector: qué estilo, qué gancho, qué gráficos

Para cada sector: preset recomendado, **gancho** (primeros 2 s), **gráficos que explican** y **líneas rojas**. Siempre usa las palabras reales del vídeo del usuario.

## Tecnología / SaaS / apps
- Preset `neo-tech` (o `apple-clean` si es premium). Subtítulos `karaoke`.
- Gancho: una cifra o un antes/después ("De 4 h a 4 min"), `hook` con el número.
- Gráficos: `stat` (resultado), `flow` (cómo funciona), `code` (para devs), `cards` (features), `image` (captura de la app con brillo).
- Rojo: promesas de rendimiento sin dato; capturas con datos de clientes reales.

## Inteligencia artificial / agentes
- Preset `ai-futurista`, look `cine`. Fondo `aurora`.
- Gancho: pregunta o afirmación que rompa algo ("Esta IA ya hace mi trabajo") + `hook` con la palabra IA o un número.
- Gráficos: `neural`, `flow` (agente → herramientas → resultado), `code` (prompt/respuesta), `list` (capacidades), palabra gigante con el nombre del modelo.
- Rojo: no antropomorfizar de más; no prometer exactitud; cita la fuente si compara modelos.

## Automatización / no-code (n8n, Make, Zapier)
- Preset `neo-tech`. Fondo `grid`.
- Gancho: "Esto lo hacía a mano cada día" → muestra el flujo en 1 s.
- Gráficos: **`flow`** es el protagonista (trigger → proceso → resultado), `stat` (horas ahorradas), `cards` (herramientas conectadas con su logo `image`), `chip` "automático".
- Rojo: logos de terceros sin permiso en anuncios de pago.

## Marca personal / creadores / infoproductos
- Preset `bold-creator`. Subtítulos `impact` (una palabra), cortes de silencios (`--cut`), golpes de zoom en cada frase fuerte.
- Gancho: afirmación corta y polémica en el segundo 0, palabra gigante.
- Gráficos: `giantWord` por idea, `chip` de cifras, `cards` de pasos, CTA con `closing`.
- Rojo: resultados garantizados, "hazte rico".

## Salud / clínicas / bienestar
- Preset `warm-human`. Subtítulos `pill`, mucha cara visible, nada sobre rostro ni manos.
- Gancho: pregunta que la gente se hace ("¿Es malo…?").
- Gráficos: hojas con ilustraciones propias (sin emojis), tarjetas de veredicto (BUENA / A LA BASURA), cronómetros.
- Rojo: "sin dolor", "para siempre", "garantizado", antes/después reales, precios, hablar a la persona en rótulos. Las afirmaciones médicas las confirma el profesional.

## Lujo / inmobiliaria / moda / hostelería
- Preset `luxury`. Subtítulos `minimal` (serif cursiva). Look `moody`. Zoom lento.
- Gancho: plano bello + una línea corta en serif; sin cortes frenéticos.
- Gráficos: `title` con palabra en serif, `image` de producto/propiedad, cifras discretas (`stat`).
- Rojo: precios si el sector los regula; datos de clientes.

## Finanzas / consultoría / B2B
- Preset `apple-clean`. Sobrio, `stat` y `list`.
- Gancho: un dato incómodo. Gráficos: barras (`stat.bars`), `cards` comparativas, `flow` de proceso.
- Rojo: rentabilidades prometidas, consejo financiero personalizado (avisa de que no lo es).

## E-commerce / producto físico
- Preset `bold-creator` o `apple-clean`. Foto del producto con fondo transparente (`image`/`cards`) → foto real del cliente, nunca stock.
- Gancho: el producto en la mano; `giantWord` con el nombre. CTA con `chip`.
- Rojo: reseñas falsas, comparativas sin base.

## Educación / formación
- Preset `apple-clean` o `warm-human`. `list` con ✓ para objetivos, `flow` para método, `stat` para resultados reales.
- Gancho: "En 3 pasos…" con `hook` "3".

## Reacción a otros vídeos (cualquier sector)
- Pantalla partida: subtítulos en cápsula en la costura, **sin zoom ni gráficos** durante la reacción (`video.zoom: 0`), y los motion graphics solo cuando vuelve la persona a pantalla completa, con la caída de música justo en ese corte. Menciona/pide permiso al autor del vídeo original.
