import React from "react";
import { AbsoluteFill, random } from "remotion";
import { prog } from "../anim";
import { spec } from "../spec";

/**
 * ACABADO DE CINE (spec.cine): viñeta suave, grano de película (ligero, barato de renderizar) y bandas negras
 * que se abren al empezar y se cierran al final con fundido a negro, para que el vídeo "cierre" de verdad.
 *   "cine": { "grain": 0.06, "vignette": 0.35, "bars": 150, "openSec": 0.7, "closeSec": 1.1 }
 */
export const Cine: React.FC<{ t: number }> = ({ t }) => {
  const c = spec.cine!;
  const D = spec.durationSec;
  const barras = c.bars ?? 150;
  const abre = 1 - prog(t, 0, c.openSec ?? 0.7);
  const cierra = prog(t, D - (c.closeSec ?? 1.1), D - 0.25);
  const alto = barras * Math.max(abre, cierra);
  const negro = prog(t, D - 0.3, D - 0.02);
  const semilla = Math.floor(t * 24);
  const dx = Math.floor(random(`gx${semilla}`) * 200);
  const dy = Math.floor(random(`gy${semilla}`) * 200);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 62% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${c.vignette ?? 0.35}) 100%)` }} />
      {(c.grain ?? 0.06) > 0 && (
        <AbsoluteFill style={{ opacity: c.grain ?? 0.06, mixBlendMode: "overlay" }}>
          <svg width="100%" height="100%">
            <filter id="grano">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={semilla % 97} stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect x={-dx} y={-dy} width="120%" height="120%" filter="url(#grano)" />
          </svg>
        </AbsoluteFill>
      )}
      {alto > 0.5 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: alto, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: alto, background: "#000" }} />
        </>
      )}
      {negro > 0 && <AbsoluteFill style={{ background: "#000", opacity: negro }} />}
    </AbsoluteFill>
  );
};
