import { Audio, Sequence, staticFile } from "remotion";
import envelope from "../../project/envelope.json";
import { fps, prog } from "../anim";
import { spec } from "../spec";

/**
 * MÚSICA + EFECTOS con "ducking": bajan solos mientras la persona habla (envolvente de su voz, project/envelope.json,
 * generada por scripts/envelope.py). La voz original NO se toca. La pista de música debe estar YA recortada al punto de
 * inicio (scripts/cut-music.mjs): no usar `trimBefore` con función de volumen (el fotograma llega desplazado).
 *
 * Niveles: la voz de cada vídeo es distinta. `scripts/mix-advisor.py` mide la voz y la música y sugiere `music.gain` y
 * `sfxGain` para que la música quede ≈ −14 dB bajo la voz.
 */
const env = envelope as { hz: number; values: number[] };
const voz = (t: number) => env.values[Math.max(0, Math.min(env.values.length - 1, Math.round(t * env.hz)))] ?? 0;

export const Musica: React.FC = () => {
  const m = spec.music;
  if (!m) {
    return null;
  }
  const F = fps();
  const nivel = (t: number) => {
    const entra = prog(t, 0, m.fadeIn ?? 0.9);
    const sale = 1 - prog(t, spec.durationSec - (m.fadeOut ?? 1.6), spec.durationSec);
    const duck = 1 - (m.duck ?? 0.62) * Math.min(1, voz(t) * 1.4);
    // pequeño hundimiento justo antes de la caída: el golpe suena más
    const hund = m.dropAt ? 1 - 0.7 * Math.max(0, Math.min(1, (t - (m.dropAt - 0.45)) / 0.45)) * (t < m.dropAt ? 1 : 0) : 1;
    return Math.min(1, entra * sale * duck * hund * m.gain);
  };
  return <Audio src={staticFile(m.src)} volume={(f) => nivel(f / F)} />;
};

export const Efectos: React.FC = () => {
  const F = fps();
  const g = spec.sfxGain ?? 1;
  return (
    <>
      {spec.sfx.map((s, i) => {
        const inicio = Math.max(0, Math.round(s.t * F));
        return (
          <Sequence key={i} from={inicio} layout="none">
            <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={(f) => s.v * g * (1 - 0.6 * voz((inicio + f) / F))} />
          </Sequence>
        );
      })}
    </>
  );
};
