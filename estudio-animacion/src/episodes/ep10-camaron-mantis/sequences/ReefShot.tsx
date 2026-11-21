// PLANO DEL ARRECIFE: escenario con parallax + protagonista (con la máscara de la grieta y la sombra
// interior del refugio) + presa + efectos (destello contenido, onda de presión, cavitación,
// sedimento) + pez intruso + siluetas de grandes animales. Se usa en las secuencias 1–12 y 16–20.
import React from 'react';
import {clamp, hash1} from '../../../engine/math';
import {Fish} from '../../ep08-medusa-inmortal/Environments/UnderwaterEnvironment';
import {Cam, layerT} from '../camera/CameraSystem';
import {MantisShrimp} from '../characters/MantisShrimp';
import {Snail} from '../characters/Snail';
import {EV} from '../config/sequences';
import {Cavitation, ImpactFlash, PressureRing} from '../effects/Effects';
import {CREVICE, ReefStage, SedimentPuff} from '../environment/ReefStage';
import {NearSediment, ShellBits} from '../particles/Particles';
import {CONTACT, mantisAt, MX, slowTime, SNAIL_S, snailAt, SX} from './world';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

/** Gran raya (silueta lejana) para «un océano de gigantes». */
const GiantRay: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => {
  const fl = Math.sin(t * 1.1) * 26;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)}) rotate(90)`} opacity={0.42}>
      <path d={`M0,-70 C110,-76 250,-40 360,${f1(8 + fl)} C250,36 120,70 40,92 L0,104 L-40,92 C-120,70 -250,36 -360,${f1(8 + fl)} C-250,-40 -110,-76 0,-70Z`} fill="#0c2640" />
      <path d="M-34,-66 q-14,-30 4,-44 M34,-66 q14,-30 -4,-44" stroke="#0c2640" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M0,100 L0,320" stroke="#0c2640" strokeWidth={8} strokeLinecap="round" />
      <path d={`M-300,${f1(14 + fl)} C-200,-10 -90,-40 0,-50 C90,-40 200,-10 300,${f1(14 + fl)}`} stroke="#1c4a6a" strokeWidth={6} fill="none" opacity={0.6} />
    </g>
  );
};

export const ReefShot: React.FC<{t: number; cam: Cam; tone?: number; snail?: boolean; bits?: boolean}> = ({t, cam, tone = 0.32, snail = false, bits = false}) => {
  const m = mantisAt(t);
  const s = snailAt(t);
  const te = slowTime(t);
  const sinceHit = te - s.lastHit;
  // sedimento al caminar (cada apoyo) y al golpear
  const stepPuff = m.walking > 0.3 ? ((m.walk % 1) + 1) % 1 : -1;
  // pez intruso en la secuencia 17
  const fishK = t > 146.4 && t < 151 ? 1 : 0;
  const fx = t < 148.6 ? -200 + (t - 146.4) * 255 : 361 - (t - 148.6) * 520;
  return (
    <ReefStage
      cam={cam}
      t={t}
      tone={tone}
      fish={1}
      front={
        <>
          {t > 162 && t < 172 && (
            <g transform={layerT(cam, 0.72)}>
              <GiantRay x={-1400 + (t - 162) * 260} y={-650} s={2.4} t={t} />
              <Fish x={2200 - (t - 162) * 180} y={-1500} s={9} t={t} seed={4} dir={-1} c1="#1a3a5a" c2="#12304a" op={0.5} />
            </g>
          )}
        </>
      }
    >
      <defs>
        <clipPath id="ep10crev">
          <ellipse cx={CREVICE.x} cy={CREVICE.y} rx={CREVICE.rx} ry={CREVICE.ry} />
          <rect x={CREVICE.x} y={-3000} width={6000} height={6000} />
        </clipPath>
        <linearGradient id="ep10hole" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#020308" stopOpacity={0.98} />
          <stop offset="0.5" stopColor="#020308" stopOpacity={0.88} />
          <stop offset="0.78" stopColor="#020308" stopOpacity={0.25} />
          <stop offset="1" stopColor="#020308" stopOpacity={0} />
        </linearGradient>
      </defs>
      <NearSediment t={t} x0={-900} x1={1500} k={0.8} />
      {bits && <ShellBits x={SX} />}
      {snail && <Snail x={s.x} y={2} s={SNAIL_S} t={te} crack={s.crack} shake={s.shake} hide={s.hide} facing={-1} />}
      {/* sombra de contacto del protagonista */}
      <ellipse cx={m.x + (-20 * MSs(m.yaw))} cy={4} rx={150 * m.scale} ry={12} fill="#04101a" opacity={0.28} />
      <g clipPath="url(#ep10crev)">
        <MantisShrimp uid="mx" p={m} />
        <ellipse cx={CREVICE.x} cy={CREVICE.y} rx={CREVICE.rx} ry={CREVICE.ry} fill="url(#ep10hole)" opacity={m.x < 60 ? clamp((60 - m.x) / 80) : 0} />
      </g>
      {stepPuff >= 0 && stepPuff < 0.35 && <SedimentPuff x={m.x - 10} u={stepPuff * 1.6} s={0.25} />}
      {snail && sinceHit >= 0 && sinceHit < 1.4 && (
        <>
          <SedimentPuff x={SX} u={sinceHit * 0.9} s={0.7} />
          <ImpactFlash x={CONTACT.x + 6} y={CONTACT.y} u={sinceHit} s={0.6} />
          <PressureRing x={CONTACT.x + 6} y={CONTACT.y} u={sinceHit * 1.4} s={0.6} />
        </>
      )}
      {snail && t > 89.4 && t < 98.8 && <Cavitation x={CONTACT.x + 8} y={CONTACT.y} t={t * 0.35} t0={EV.cav[0] * 0.35} k={clamp((t - 90.5) / 0.4) * clamp((98.6 - t) / 0.6)} s={0.32} />}
      {fishK > 0 && <Fish x={fx} y={-120 + Math.sin(t * 3) * 12} s={1.3} t={t} seed={9} dir={t < 148.6 ? 1 : -1} c1="#ffd23f" c2="#3a7ae8" />}
      {/* burbujas del pleópodo cuando está quieto */}
      {Array.from({length: 3}, (_, i) => {
        const ph = ((t * 0.4 + hash1(i * 7)) % 1 + 1) % 1;
        return <circle key={i} cx={m.x - 60 + i * 10} cy={-30 - ph * 260} r={2 + i} fill="none" stroke="#e8fbff" strokeWidth={1.2} opacity={(1 - ph) * 0.6} />;
      })}
    </ReefStage>
  );
};
const MSs = (yaw: number) => Math.sign(Math.cos(yaw) || 1);
export {MX};
