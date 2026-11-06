# FrameNova 🎬
*(antes llamada «Reel Studio»)*

**Un editor de vídeo profesional dentro de Claude.** Dale un vídeo en bruto y te devuelve un reel con cortes fluidos, color de cine (S-Log3, Apple Log…), subtítulos modernos, motion graphics, música, efectos y cierre de marca, exportado en máxima calidad para Instagram/TikTok y con su copy. Para cualquier sector: tecnología, IA, automatización, salud, lujo, creadores…

## Instalar (elige una)

**1 · Una línea (cualquier agente compatible con skills):**
```bash
npx skills add https://github.com/TheNodecode/FrameNova --skill framenova
```

**2 · Con Git (Claude Code):**
```bash
git clone https://github.com/TheNodecode/FrameNova.git
cd FrameNova
node skills/framenova/install.mjs
```

**3 · Sin Git:** descarga el ZIP del repositorio (botón verde *Code › Download ZIP*), descomprime y ejecuta `node skills/framenova/install.mjs`.

Reinicia Claude Code y escribe:
> *Usa FrameNova para editar este vídeo: C:/videos/mi-video.mp4*

Claude te hará 10 preguntas rápidas (marca, estilo, cámara, música…) y montará todo.

**Requisitos:** Node.js 20+. Opcionales: ffmpeg completo, Python 3 + numpy, onnxruntime + pillow (recorte de personas). `node skills/framenova/scripts/doctor.mjs` te dice qué tienes.

📖 Documentación completa: [`skills/framenova/README.md`](skills/framenova/README.md) · Instrucciones del agente: [`skills/framenova/SKILL.md`](skills/framenova/SKILL.md)

## Licencias
Código y efectos de sonido: MIT. Remotion tiene licencia propia (**las empresas de más de 3 personas necesitan licencia**: https://remotion.pro). No incluye música, LUTs de fabricantes ni el modelo de recorte. Ver [`skills/framenova/NOTICE.md`](skills/framenova/NOTICE.md).
