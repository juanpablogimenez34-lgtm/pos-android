// DEMOSTRACIÓN DEL PERSONAJE (8 s · 1080×1920 · 30 fps · 240 fotogramas). Solo el personaje:
//  0,0–3,0 s  plano medio lateral: nada hacia la derecha; la onda recorre la aleta dorsal.
//  3,0–5,6 s  acercamiento a la cabeza y la cresta; la boca se abre levemente.
//  5,6–8,0 s  la cámara se aleja: el cuerpo completo cruza un haz de luz.
// Iluminación submarina: rayos, haz volumétrico, luz de sujeto azul, bokeh, nieve marina, viñeta.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFonts, FONT_FAMILY} from '../../../engine/fonts';
import {clamp, hash1} from '../../../engine/math';
import {useTime} from '../../../engine/useTime';
import {Grade, ScreenRays, SubjectLight} from '../../ep10-camaron-mantis/lighting/Lighting';
import {DeepSea} from '../../ep13-tiburon-duende/environment/DeepSea';
import {LightBeam} from '../../ep14-pez-remo/components/VolumetricLight';
import {Bokeh, breathe, cam, shot, toScreen} from '../../../studio2';
import {OarfishHero} from '../character/OarfishHero';

export const OarfishDemo: React.FC = () => {
  ensureFonts();
  const t = useTime();
  const hx = -260 + t * 62; // posición de la cabeza (avance lento y controlado)
  const hy = Math.sin(t * 0.6) * 10;
  const mouth = 0.22 + 0.45 * clamp((t - 3.6) / 0.5) * clamp((4.9 - t) / 0.5);
  let c = shot(t, 0, 3.0, cam(hx - 360, hy + 10, 0.92), cam(hx - 300, hy + 20, 0.95), 'linear');
  if (t > 3.0) c = shot(t, 3.0, 4.2, cam(hx - 300, hy + 20, 0.95), cam(hx + 30, hy - 70, 2.05), 'cine');
  if (t > 4.2) c = shot(t, 4.2, 5.6, cam(hx + 30, hy - 70, 2.05), cam(hx + 10, hy - 60, 2.2), 'linear');
  if (t > 5.6) c = shot(t, 5.6, 8, cam(hx + 10, hy - 60, 2.2), cam(hx - 820, hy - 40, 0.46), 'cine');
  c = breathe(c, t, 0.6);
  const hs = toScreen(c, hx + 90, hy - 20);
  const beamX = toScreen(c, hx - 500, -600).x;
  return (
    <AbsoluteFill style={{background: '#061427'}}>
      <svg width={1080} height={1920}>
        <DeepSea cam={c} t={t} d={0.5} fish={0.35} lights={0.6}>
          <OarfishHero uid="demo" p={{x: hx, y: hy, scale: 1, light: 1, rig: {t, mouth, curve: 20, curvePhase: 0.4}}} />
          {/* burbujas pequeñas que escapan de las branquias */}
          {Array.from({length: 6}, (_, i) => {
            const ph = ((t * 0.5 + hash1(i * 3)) % 1 + 1) % 1;
            return <circle key={i} cx={hx + 20 + Math.sin(t * 3 + i) * 6} cy={hy + 10 - ph * 260} r={2 + hash1(i) * 3} fill="none" stroke="#dff6ff" strokeWidth={1.2} opacity={(1 - ph) * 0.7} />;
          })}
        </DeepSea>
        <Bokeh t={t} n={9} k={0.85} />
      </svg>
      <LightBeam x={beamX} w={150 * Math.max(0.6, c.zoom)} t={t} k={0.55 + 0.35 * clamp((t - 5.6) / 1.5)} />
      <ScreenRays t={t} k={0.45} />
      <SubjectLight x={hs.x} y={hs.y} r={620} k={0.55} color="rgba(120,200,255,0.28)" />
      <Grade depth={0.45} vignette={0.85} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT_FAMILY, color: 'rgba(220,231,236,0.75)', fontSize: 26, fontWeight: 700, letterSpacing: 3}}>PEZ REMO GIGANTE · PRUEBA DE PERSONAJE</div>
    </AbsoluteFill>
  );
};
