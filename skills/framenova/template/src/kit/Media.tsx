import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fps } from "../anim";
import { spec } from "../spec";
import type { Look } from "../theme";

/** Filtros SVG de "look" (colorización rápida) y nitidez. Se aplican con `filter: url(#look-cine) url(#sharp)`. */
export const LookDefs: React.FC = () => {
  const s = spec.sharpen ?? 0.35;
  const k = [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0].join(" ");
  const t = (r: string, g: string, b: string) => (
    <feComponentTransfer>
      <feFuncR type="table" tableValues={r} />
      <feFuncG type="table" tableValues={g} />
      <feFuncB type="table" tableValues={b} />
    </feComponentTransfer>
  );
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="look-natural" colorInterpolationFilters="sRGB">
        {t("0 0.26 0.52 0.78 1", "0 0.26 0.52 0.78 1", "0 0.26 0.52 0.78 1")}
      </filter>
      <filter id="look-clean" colorInterpolationFilters="sRGB">
        {t("0 0.3 0.58 0.84 1", "0 0.3 0.58 0.84 1", "0.01 0.31 0.58 0.83 0.99")}
        <feColorMatrix type="saturate" values="0.94" />
      </filter>
      {/* cine: sombras hacia verde-azulado, luces cálidas, curva en S suave */}
      <filter id="look-cine" colorInterpolationFilters="sRGB">
        {t("0 0.2 0.5 0.82 1", "0 0.23 0.5 0.8 0.98", "0.05 0.27 0.5 0.75 0.93")}
        <feColorMatrix type="saturate" values="1.06" />
      </filter>
      <filter id="look-moody" colorInterpolationFilters="sRGB">
        {t("0 0.17 0.42 0.74 0.97", "0 0.17 0.42 0.74 0.97", "0.01 0.19 0.43 0.73 0.95")}
        <feColorMatrix type="saturate" values="0.82" />
      </filter>
      {/* pro: retoque suave sobre material YA colorizado: algo más de contraste, piel cálida, sombras profundas */}
      <filter id="look-pro" colorInterpolationFilters="sRGB">
        {t("0 0.22 0.52 0.83 1", "0 0.22 0.5 0.81 0.99", "0.02 0.22 0.47 0.77 0.96")}
        <feColorMatrix type="saturate" values="1.12" />
      </filter>
      <filter id="look-punch" colorInterpolationFilters="sRGB">
        {t("0 0.2 0.52 0.86 1", "0 0.2 0.52 0.86 1", "0 0.2 0.52 0.86 1")}
        <feColorMatrix type="saturate" values="1.25" />
      </filter>
      {spec.grade && (
        <filter id="look-grade" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={spec.grade.r.join(" ")} />
            <feFuncG type="table" tableValues={spec.grade.g.join(" ")} />
            <feFuncB type="table" tableValues={spec.grade.b.join(" ")} />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values={String(spec.grade.sat)} />
        </filter>
      )}
      <filter id="sharp" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feConvolveMatrix order="3" kernelMatrix={k} preserveAlpha="true" />
      </filter>
    </svg>
  );
};

export const filtroVideo = (look: Look | "grade") => `url(#look-${look}) url(#sharp)`;

const nombreMatte = (i: number) => `${spec.matte!.dir}/m${String(Math.max(0, Math.min(spec.matte!.max, i))).padStart(4, "0")}.png`;

/** Vídeo de origen con cortes (segments). Los tiempos de salida son contiguos: el audio original queda intacto. */
export const SourceVideo: React.FC<{ muted?: boolean }> = ({ muted }) => {
  const v = spec.video;
  if (!v) {
    return null;
  }
  const F = fps();
  const segs = v.segments && v.segments.length ? v.segments : [[0, spec.durationSec] as [number, number]];
  let acc = 0;
  return (
    <>
      {segs.map(([a, b], i) => {
        const from = Math.round(acc * F);
        const dur = Math.max(1, Math.round((b - a) * F));
        acc += b - a;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <OffthreadVideo src={staticFile(v.src)} trimBefore={Math.round(a * F)} muted={muted ?? v.muted} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
        );
      })}
    </>
  );
};

/** Recorte de la persona (matte PNG por fotograma) para poner gráficos DETRÁS de ella. Mismo vídeo, sin audio, enmascarado. */
export const Cutout: React.FC = () => {
  const v = spec.video;
  if (!v || !spec.matte) {
    return null;
  }
  const F = fps();
  const segs = v.segments && v.segments.length ? v.segments : [[0, spec.durationSec] as [number, number]];
  let acc = 0;
  return (
    <>
      {segs.map(([a, b], i) => {
        const from = Math.round(acc * F);
        const dur = Math.max(1, Math.round((b - a) * F));
        acc += b - a;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <CutoutSeg a={a} />
          </Sequence>
        );
      })}
    </>
  );
};

const CutoutSeg: React.FC<{ a: number }> = ({ a }) => {
  const F = fps();
  const f = useCurrentFrame();
  const m = staticFile(nombreMatte(Math.round(a * F) + f));
  const v = spec.video!;
  return (
    <>
      <Img src={m} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      <AbsoluteFill style={{ WebkitMaskImage: `url(${m})`, WebkitMaskSize: "100% 100%", WebkitMaskRepeat: "no-repeat" }}>
        <OffthreadVideo src={staticFile(v.src)} trimBefore={Math.round(a * F)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </>
  );
};
