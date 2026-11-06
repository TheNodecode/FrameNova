import { AbsoluteFill, useVideoConfig } from "remotion";
import { lenta, prog, setFps, useT } from "./anim";
import { Efectos, Musica } from "./kit/Audio";
import { Background } from "./kit/Background";
import { CardBoard } from "./kit/Cards";
import { Cierre } from "./kit/Closing";
import { Burst, Chip, GiantWord, Hook, StatLayer } from "./kit/Fx";
import { Cutout, filtroVideo, LookDefs, SourceVideo } from "./kit/Media";
import { progresoHoja, SheetView } from "./kit/Sheet";
import { Subtitulos } from "./kit/Subtitles";
import { spec, type Layer } from "./spec";
import { cargarFuentes, theme } from "./theme";

cargarFuentes();

const Capa: React.FC<{ l: Layer }> = ({ l }) => {
  switch (l.type) {
    case "giantWord":
      return <GiantWord l={l} />;
    case "hook":
      return <Hook l={l} />;
    case "burst":
      return <Burst at={l.at} />;
    case "chip":
      return <Chip l={l} />;
    case "stat":
      return <StatLayer l={l} />;
    case "cards":
      return <CardBoard l={l} />;
  }
};

/**
 * LA COMPOSICIÓN. Orden de capas: fondo/vídeo (con look y nitidez) → gráficos DETRÁS de la persona → recorte de la persona
 * (si hay matte) → hojas a pantalla completa → subtítulos → música y efectos → cierre. Todo sale de `project/spec.json`.
 */
export const Reel: React.FC = () => {
  const { fps } = useVideoConfig();
  setFps(fps);
  const t = useT();
  const empuja = spec.sheets.reduce((m, s) => Math.max(m, progresoHoja(t, s)), 0);

  const z = spec.video?.zoom ?? 1;
  const ultimo = [...spec.punches].reverse().find((p) => t >= p);
  const golpe = ultimo !== undefined ? 0.045 * (1 - prog(t, ultimo, ultimo + 0.45)) : 0;
  const segActual = 0;
  const lento = 0.035 * prog(t, segActual, spec.durationSec, lenta);
  const escala = (1 + z * (lento + golpe)) * (1 - 0.07 * empuja) * (z > 0 ? 1.025 : 1);
  const manoX = z > 0 ? Math.sin(t * 0.9) * 4 + Math.sin(t * 2.3) * 1.5 : 0;
  const manoY = z > 0 ? Math.cos(t * 0.7) * 4 + Math.sin(t * 1.9) * 1.2 : 0;
  const mov: React.CSSProperties = {
    scale: String(escala),
    rotate: `${z > 0 ? Math.sin(t * 0.55) * 0.22 : 0}deg`,
    translate: `${manoX}px ${-30 * empuja + manoY}px`,
    transformOrigin: "50% 40%",
    filter: `${filtroVideo(spec.look ?? theme.look)} brightness(${1 - 0.3 * empuja})`,
  };
  const detras = spec.layers;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <LookDefs />
      {spec.video ? (
        <AbsoluteFill style={mov}>
          <SourceVideo />
        </AbsoluteFill>
      ) : (
        <Background />
      )}

      {detras.map((l, i) => (
        <Capa key={i} l={l} />
      ))}

      {spec.matte && spec.video && (
        <AbsoluteFill style={mov}>
          <Cutout />
        </AbsoluteFill>
      )}

      {spec.sheets.map((s, i) => (
        <SheetView key={i} s={s} width={spec.format.width} height={spec.format.height} />
      ))}

      <Subtitulos enHoja={empuja} />
      <Musica />
      <Efectos />
      <Cierre />
    </AbsoluteFill>
  );
};
