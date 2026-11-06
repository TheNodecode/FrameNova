-- FrameNova · monta en DaVinci Resolve (también la versión GRATIS) el corte que preparó Claude.
-- Se ejecuta DESDE DENTRO de Resolve: Espacio de trabajo > Scripts > Edit > "Claude edita - montar corte".
-- Qué hace: importa tu vídeo original, crea la línea de tiempo vertical 1080x1920 con los cortes (cortes.edl),
-- aplica el look "pro" (look-pro.cube) a cada plano e importa los subtítulos (subtitulos.srt) al Media Pool.
-- No borra ni modifica nada de lo que ya tengas: crea una línea de tiempo NUEVA en el proyecto abierto.

local CARPETA = [[__CARPETA__]]
local ORIGINAL = [[__ORIGINAL__]]
local NOMBRE = "Claude edita - corte"

local function aviso(t) print("[Claude edita] " .. t) end

local resolve = Resolve()
local proyecto = resolve:GetProjectManager():GetCurrentProject()
if not proyecto then aviso("Abre (o crea) un proyecto primero.") return end
local pool = proyecto:GetMediaPool()

-- 1) el original en el Media Pool
local clips = pool:ImportMedia({ ORIGINAL })
if not clips or #clips == 0 then aviso("No pude importar el vídeo original: " .. ORIGINAL) end

-- 2) línea de tiempo desde la EDL, enlazada al clip importado
local tl = pool:ImportTimelineFromFile(CARPETA .. "cortes.edl", {
  timelineName = NOMBRE,
  importSourceClips = false,
})
if not tl then aviso("No pude crear la línea de tiempo desde cortes.edl") return end
proyecto:SetCurrentTimeline(tl)

-- 3) formato vertical
pcall(function()
  tl:SetSetting("useCustomSettings", "1")
  tl:SetSetting("timelineResolutionWidth", "1080")
  tl:SetSetting("timelineResolutionHeight", "1920")
  tl:SetSetting("timelineFrameRate", "23.976")
end)

-- 4) look "pro" en el primer nodo de cada plano
local n = 0
for _, item in ipairs(tl:GetItemListInTrack("video", 1) or {}) do
  if pcall(function() return item:SetLUT(1, CARPETA .. "look.cube") end) then n = n + 1 end
end
aviso("LUT aplicada a " .. n .. " planos.")

-- 5) subtítulos al Media Pool (arrástralos a la pista de subtítulos si no aparecen solos)
local subs = pool:ImportMedia({ CARPETA .. "subtitulos.srt" })
if subs and #subs > 0 then
  pcall(function() pool:AppendToTimeline(subs) end)
  aviso("Subtítulos importados.")
end

-- 6) exportación: H.264 vertical, máxima calidad
pcall(function()
  proyecto:SetCurrentRenderFormatAndCodec("mp4", "H264")
  proyecto:SetRenderSettings({ FormatWidth = 1080, FormatHeight = 1920, TargetDir = CARPETA, CustomName = "framenova-davinci" })
end)
aviso("Listo: línea de tiempo '" .. NOMBRE .. "'.")
