// ESCENARIO SUBMARINO del episodio: reutiliza (sin modificarlos) el agua, los peces y las
// partículas del Ep. 08, y añade el arrecife propio de este documental: roca con GRIETA-REFUGIO
// (x = 0), corales cerebro, ramificados y en placa, gorgonias, algas que se mecen, arena con
// ondulaciones y granos, conchas, burbujas ocasionales y sedimento que se levanta.
import React from 'react';
import {clamp, hash1, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../camera/CameraSystem';
import {water, WaterBack, School} from '../../ep08-medusa-inmortal/Environments/UnderwaterEnvironment';
import {OceanParticles} from '../../ep08-medusa-inmortal/Environments/OceanParticles';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
export const CREVICE = {x: 0, y: -46, rx: 120, ry: 62};

const BrainCoral: React.FC<{x: number; s: number; c: string; seed: number}> = ({x, s, c, seed}) => (
  <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>
    <path d="M-80,6 Q-86,-70 0,-82 Q86,-70 80,6Z" fill={c} stroke={mixColor(c, '#000', 0.4)} strokeWidth={3} />
    {Array.from({length: 7}, (_, i) => (
      <path key={i} d={`M${-70 + i * 4},${-6 - i * 9} q${30 + hash1(seed + i) * 20},${-14} ${60 + i * 6},${-2} t${50 - i * 6},${-4}`} stroke={mixColor(c, '#000', 0.3)} strokeWidth={3} fill="none" opacity={0.7} />
    ))}
    <path d="M-50,-50 Q-10,-80 30,-74" stroke="#ffffff" strokeWidth={5} opacity={0.2} fill="none" strokeLinecap="round" />
  </g>
);

const Staghorn: React.FC<{x: number; s: number; c: string; t: number; seed: number}> = ({x, s, c, t, seed}) => {
  const br = (bx: number, by: number, a: number, l: number, d: number): React.ReactNode[] => {
    if (d === 0) return [];
    const ex = bx + Math.sin(a) * l;
    const ey = by - Math.cos(a) * l;
    return [
      <path key={`${d}${bx.toFixed(0)}${a.toFixed(2)}`} d={`M${f1(bx)},${f1(by)} L${f1(ex)},${f1(ey)}`} stroke={c} strokeWidth={4 + d * 3} strokeLinecap="round" />,
      ...br(ex, ey, a - 0.45 + Math.sin(t * 0.5 + seed) * 0.02, l * 0.75, d - 1),
      ...br(ex, ey, a + 0.4, l * 0.7, d - 1),
    ];
  };
  return <g transform={`translate(${f1(x)} 0) scale(${f1(s)})`}>{br(0, 0, 0, 60, 4)}</g>;
};

const PlateCoral: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${f1(x)} ${f1(y)}) scale(${f1(s)})`}>
    <ellipse cx={0} cy={0} rx={110} ry={20} fill={c} stroke={mixColor(c, '#000', 0.35)} strokeWidth={3} />
    <ellipse cx={0} cy={-6} rx={90} ry={12} fill={mixColor(c, '#ffffff', 0.2)} />
    <path d="M-6,12 L-2,70" stroke={mixColor(c, '#000', 0.3)} strokeWidth={12} />
  </g>
);

const Algae: React.FC<{x: number; h: number; c: string; t: number; seed: number}> = ({x, h, c, t, seed}) => (
  <g transform={`translate(${f1(x)} 0)`}>
    {[0, 1, 2].map((k) => {
      const pts = Array.from({length: 8}, (_, i) => {
        const u = i / 7;
        return {x: k * 10 - 10 + Math.sin(t * 1.1 + seed + u * 3 + k) * 18 * u, y: -u * h * (0.8 + 0.2 * k)};
      });
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(p.x)},${f1(p.y)}`).join(' ');
      return <path key={k} d={d} stroke={c} strokeWidth={9 - k * 2} fill="none" strokeLinecap="round" opacity={0.9} />;
    })}
  </g>
);

/** Roca grande con la grieta-refugio: volumen con degradado (luz cenital), grietas, texturas
 *  irregulares, esponjas y pequeños corales que crecen en la parte alta. */
export const RockWithCrevice: React.FC<{tone: number; light?: number}> = ({tone, light = 1}) => {
  const w = water(tone);
  const rock = mixColor('#7a7468', w.fog, 0.22);
  const rockL = mixColor('#a8a090', w.light, 0.15);
  const rockD = mixColor('#2e2c34', w.fog, 0.15);
  const outline = 'M-520,20 Q-560,-220 -340,-330 Q-250,-372 -160,-380 Q-60,-420 60,-392 Q200,-372 300,-300 Q430,-210 462,-90 Q490,0 470,20Z';
  return (
    <g>
      <defs>
        <linearGradient id="ep10rock" x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={rockL} />
          <stop offset="0.45" stopColor={rock} />
          <stop offset="1" stopColor={rockD} />
        </linearGradient>
        <radialGradient id="ep10rockAO" cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#020308" stopOpacity={0.55} />
          <stop offset="1" stopColor="#020308" stopOpacity={0} />
        </radialGradient>
        <clipPath id="ep10rockclip">
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill="url(#ep10rock)" stroke={rockD} strokeWidth={5} />
      <g clipPath="url(#ep10rockclip)">
        {/* bloques y facetas (volumen) */}
        {Array.from({length: 9}, (_, i) => {
          const x = -480 + i * 115 + hash1(i * 3) * 40;
          const y = -320 + hash1(i * 5) * 220;
          return <path key={`f${i}`} d={`M${f1(x)},${f1(y)} q${f1(40 + hash1(i) * 50)},${f1(-30 - hash1(i * 2) * 30)} ${f1(110 + hash1(i * 4) * 60)},${f1(10)} q${f1(-20)},${f1(60 + hash1(i * 6) * 40)} ${f1(-90)},${f1(70)}Z`} fill={i % 2 ? rockD : rockL} opacity={0.18} />;
        })}
        {/* grietas */}
        {Array.from({length: 7}, (_, i) => {
          const x = -430 + hash1(i * 13) * 820;
          const y = -330 + hash1(i * 17) * 250;
          return <path key={`c${i}`} d={`M${f1(x)},${f1(y)} l${f1(18 + hash1(i) * 20)},${f1(30)} l${f1(-10)},${f1(28 + hash1(i * 2) * 20)} l${f1(16)},${f1(26)}`} stroke={rockD} strokeWidth={3} fill="none" opacity={0.6} />;
        })}
        {/* poros y textura fina */}
        {Array.from({length: 60}, (_, i) => (
          <ellipse key={`p${i}`} cx={-490 + hash1(i * 3.3) * 940} cy={-20 - hash1(i * 5.7) * 360} rx={2 + hash1(i) * 6} ry={1.5 + hash1(i * 2) * 3} fill={rockD} opacity={0.35} />
        ))}
        {/* esponjas incrustantes (formas irregulares) */}
        {Array.from({length: 7}, (_, i) => {
          const cx = -420 + hash1(i * 7) * 820;
          const cy = -90 - hash1(i * 11) * 200;
          const c = mixColor(['#b8607a', '#d8904a', '#7a62b0', '#4aa082'][i % 4], w.fog, 0.2);
          return <path key={`e${i}`} d={`M${f1(cx - 26)},${f1(cy)} q10,-22 26,-14 q20,-12 28,8 q8,18 -14,22 q-24,10 -40,-16Z`} fill={c} opacity={0.7} />;
        })}
        {/* oclusión ambiental en la base y sombra de la luz cenital */}
        <rect x={-560} y={-200} width={1060} height={240} fill="url(#ep10rockAO)" />
      </g>
      {/* borde iluminado por arriba */}
      <path d="M-500,-150 Q-520,-260 -340,-330 Q-250,-372 -160,-380 Q-60,-420 60,-392 Q200,-372 300,-300" stroke={mixColor(rockL, '#ffffff', 0.4)} strokeWidth={6} fill="none" opacity={0.45 * light} strokeLinecap="round" />
      {/* pequeños corales y algas sobre la roca */}
      {Array.from({length: 9}, (_, i) => {
        const x = -420 + i * 90 + hash1(i * 9) * 30;
        const y = -330 - Math.sin(((x + 520) / 990) * Math.PI) * 60 + 30;
        const c = mixColor(['#e8708a', '#f0b04a', '#5ac8a8'][i % 3], w.fog, 0.2);
        return (
          <g key={`k${i}`} transform={`translate(${f1(x)} ${f1(y)})`}>
            {[-1, 0, 1].map((k) => (
              <path key={k} d={`M0,0 q${f1(k * 8)},-16 ${f1(k * 14)},-${f1(22 + hash1(i + k) * 18)}`} stroke={c} strokeWidth={6} strokeLinecap="round" fill="none" />
            ))}
          </g>
        );
      })}
      {/* boca de la grieta: labio de roca y profundidad */}
      <ellipse cx={CREVICE.x} cy={CREVICE.y} rx={CREVICE.rx + 14} ry={CREVICE.ry + 11} fill={rockD} />
      <ellipse cx={CREVICE.x} cy={CREVICE.y} rx={CREVICE.rx} ry={CREVICE.ry} fill="#04060b" />
      <path d={`M${CREVICE.x - CREVICE.rx - 8},${CREVICE.y - 4} Q${CREVICE.x},${CREVICE.y - CREVICE.ry - 26} ${CREVICE.x + CREVICE.rx + 8},${CREVICE.y - 4}`} stroke={mixColor(rockL, '#ffffff', 0.3)} strokeWidth={5} fill="none" opacity={0.5 * light} />
      <ellipse cx={-30} cy={22} rx={520} ry={34} fill="#05070c" opacity={0.3} />
    </g>
  );
};

/** Arena con ondulaciones, granos, conchas y sedimento. */
export const SandFloor: React.FC<{tone: number; t: number; x0?: number; x1?: number}> = ({tone, t, x0 = -2600, x1 = 2600}) => {
  const w = water(tone);
  const sand = mixColor('#e0c898', w.fog, 0.3 + 0.3 * tone);
  return (
    <g>
      <rect x={x0} y={0} width={x1 - x0} height={1600} fill={sand} />
      {Array.from({length: 30}, (_, i) => (
        <path key={i} d={`M${x0 + i * ((x1 - x0) / 30)},${30 + (i % 4) * 26} q60,-10 120,0 t120,0`} stroke={mixColor(sand, '#8a7050', 0.35)} strokeWidth={4} fill="none" opacity={0.5} />
      ))}
      {Array.from({length: 120}, (_, i) => (
        <circle key={`g${i}`} cx={x0 + hash1(i * 3.1) * (x1 - x0)} cy={10 + hash1(i * 7.3) * 260} r={1.5 + hash1(i) * 2.5} fill={i % 3 ? mixColor(sand, '#ffffff', 0.4) : mixColor(sand, '#6a5030', 0.4)} opacity={0.7} />
      ))}
      {Array.from({length: 8}, (_, i) => (
        <path key={`c${i}`} transform={`translate(${f1(x0 + hash1(i * 9) * (x1 - x0))} ${f1(40 + hash1(i * 4) * 120)}) rotate(${f1(hash1(i) * 60 - 30)})`} d="M-12,0 Q0,-16 12,0Z" fill={['#f4e0d0', '#e8c0b0', '#f0d8a0'][i % 3]} stroke="#8a6a50" strokeWidth={1.5} />
      ))}
      {/* cáusticas sobre la arena */}
      {Array.from({length: 22}, (_, i) => (
        <path key={`k${i}`} d={`M${f1(x0 + i * ((x1 - x0) / 22))},${f1(70 + (i % 3) * 40)} q50,${f1(-18 + Math.sin(t * 1.3 + i) * 14)} 100,0 t100,0`} stroke={w.light} strokeWidth={3} fill="none" opacity={0.22 * (1 - tone)} />
      ))}
    </g>
  );
};

export const Bubbles: React.FC<{t: number; x: number; y: number; n?: number; k?: number}> = ({t, x, y, n = 6, k = 1}) =>
  k > 0.01 ? (
    <g opacity={k}>
      {Array.from({length: n}, (_, i) => {
        const per = 2.6 + hash1(i) * 2;
        const ph = ((t / per + hash1(i * 3)) % 1 + 1) % 1;
        return <circle key={i} cx={x + Math.sin(t * 3 + i) * 10 + (hash1(i * 5) - 0.5) * 30} cy={y - ph * 500} r={3 + hash1(i * 7) * 5} fill="none" stroke="#e8fbff" strokeWidth={1.5} opacity={1 - ph} />;
      })}
    </g>
  ) : null;

/** Sedimento que se levanta del fondo (tras un paso o un golpe). u 0…1. */
export const SedimentPuff: React.FC<{x: number; y?: number; u: number; s?: number}> = ({x, y = 0, u, s = 1}) =>
  u > 0 && u < 1.5 ? (
    <g opacity={clamp(1.4 - u)}>
      {Array.from({length: 12}, (_, i) => {
        const a = Math.PI + (i / 11) * Math.PI;
        const d = (20 + 120 * Math.sqrt(clamp(u))) * s;
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.45} r={(10 + 26 * u) * s * (0.6 + hash1(i) * 0.6)} fill="#d8c8a0" opacity={0.45} />;
      })}
    </g>
  ) : null;

/** Escenario completo: agua, capas lejanas, arrecife medio y fondo cercano con la roca. */
export const ReefStage: React.FC<{cam: Cam; t: number; tone?: number; children?: React.ReactNode; front?: React.ReactNode; rock?: boolean; fish?: number}> = ({cam, t, tone = 0.32, children, front, rock = true, fish = 1}) => {
  const w = water(tone);
  const coral = ['#e8708a', '#f0a04a', '#a07ae0', '#5ac8a8', '#e85a5a'];
  return (
    <g>
      <WaterBack cam={cam} t={t} tone={tone} rays={1} floorY={1100} />
      {fish > 0.01 && (
        <g transform={layerT(cam, 0.45)} opacity={fish}>
          <School t={t} n={18} x0={-2400} x1={2400} y={-700} spread={340} speed={50} s={1.1} c1={mixColor('#ffd27a', w.fog, 0.45)} c2={mixColor('#ff9a4a', w.fog, 0.45)} seed={21} />
          <School t={t} n={12} x0={-2400} x1={2400} y={-1250} spread={300} speed={-36} s={0.9} c1={mixColor('#7ec8e8', w.fog, 0.5)} c2={mixColor('#4a8ab8', w.fog, 0.5)} seed={27} />
        </g>
      )}
      {/* arrecife medio */}
      <g transform={layerT(cam, 0.62)}>
        <g transform="translate(0 700)">
          {Array.from({length: 16}, (_, i) => {
            const x = -2200 + i * 290 + hash1(i * 3) * 100;
            const c = mixColor(coral[i % 5], w.fog, 0.45);
            return i % 3 === 0 ? <BrainCoral key={i} x={x} s={1.3 + hash1(i) * 0.6} c={c} seed={i} /> : i % 3 === 1 ? <Staghorn key={i} x={x} s={1.6 + hash1(i) * 0.6} c={c} t={t} seed={i} /> : <Algae key={i} x={x} h={220 + hash1(i) * 120} c={mixColor('#5ab86a', w.fog, 0.45)} t={t} seed={i} />;
          })}
          <rect x={-4000} y={0} width={8000} height={1400} fill={mixColor('#b8a078', w.fog, 0.5)} />
        </g>
      </g>
      <OceanParticles cam={cam} t={t} current={0.3} density={0.7} />
      {/* plano del protagonista */}
      <g transform={layerT(cam, 1)}>
        <SandFloor tone={tone} t={t} />
        <BrainCoral x={-780} s={1.1} c={mixColor(coral[0], w.fog, 0.15)} seed={3} />
        <Staghorn x={720} s={1.4} c={mixColor(coral[1], w.fog, 0.15)} t={t} seed={5} />
        <PlateCoral x={-640} y={-300} s={1.1} c={mixColor(coral[3], w.fog, 0.15)} />
        <Algae x={560} h={260} c={mixColor('#4aa85a', w.fog, 0.1)} t={t} seed={7} />
        <Algae x={-980} h={300} c={mixColor('#4aa85a', w.fog, 0.1)} t={t} seed={8} />
        {rock && <RockWithCrevice tone={tone} />}
        {children}
        <Bubbles t={t} x={-200} y={-300} n={5} />
      </g>
      {/* primer plano desenfocado por color (más oscuro, parallax rápido) */}
      <g transform={layerT(cam, 1.45)}>
        {[-1500, 1400].map((x, i) => (
          <g key={i} transform={`translate(${x} 320)`} opacity={0.85}>
            <Algae x={0} h={520} c="#123a2a" t={t} seed={30 + i} />
            <Algae x={80} h={420} c="#0e2e22" t={t} seed={33 + i} />
          </g>
        ))}
      </g>
      {front}
    </g>
  );
};
