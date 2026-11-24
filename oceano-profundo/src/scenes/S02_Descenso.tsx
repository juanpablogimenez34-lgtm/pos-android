// ESCENA 02 — EL DESCENSO (30–80 s). Un único plano continuo: la cámara baja desde la superficie hasta la llanura
// abisal. La profundidad de la cámara sincroniza con la narración (zona iluminada → crepuscular → medianoche →
// abisal); el color del agua, los rayos y la fauna cambian con ella; los organismos atraviesan el cuadro hacia
// arriba. Indicador de profundidad con zonas y presión; visualización de la presión y de la temperatura.
import {Hatchetfish, Jellyfish, Atolla, CombJelly, Siphonophore, RedShrimp} from '../animals/Fauna';
import {Lanternfish} from '../animals/SmallFish';
import {breathe, cam} from '../camera/camera';
import {DepthGauge, Title, win} from '../components/UI';
import {Ocean} from '../environment/Ocean';
import {FONT} from '../utils/fonts';
import {clamp, hash1, lerp} from '../utils/math';
import {SceneFn} from './common';

const K = 3; // unidades del mundo por metro (eje vertical)
/** Profundidad de la cámara (m) en cada instante, sincronizada con las frases. */
const DEPTH: [number, number][] = [[30, 90], [41, 200], [51.5, 1000], [57, 3000], [61.2, 4150], [80, 4200]];
export function camDepth(t: number) {
  for (let i = 1; i < DEPTH.length; i++)
    if (t <= DEPTH[i][0]) {
      const u = clamp((t - DEPTH[i - 1][0]) / (DEPTH[i][0] - DEPTH[i - 1][0]));
      const e = u * u * (3 - 2 * u);
      // interpolación logarítmica: el descenso se ve fluido en todas las escalas
      const a = Math.log(1 + DEPTH[i - 1][1]);
      const b = Math.log(1 + DEPTH[i][1]);
      return Math.exp(lerp(a, b, e)) - 1;
    }
  return DEPTH[DEPTH.length - 1][1];
}

/** Fauna colocada a profundidades concretas (m) — aparece al pasar la cámara. */
const FAUNA: {d: number; x: number; kind: string; s: number}[] = [
  ...Array.from({length: 6}, (_, i) => ({d: 30 + i * 28, x: -700 + hash1(i * 3) * 1400, kind: 'jelly', s: 0.6 + hash1(i) * 0.5})),
  ...Array.from({length: 10}, (_, i) => ({d: 260 + i * 70, x: -800 + hash1(i * 7) * 1600, kind: i % 2 ? 'hatchet' : 'lantern', s: 1.2 + hash1(i * 2) * 0.6})),
  ...Array.from({length: 22}, (_, i) => ({d: 1080 + i * 140, x: -760 + hash1(i * 11) * 1300, kind: ['atolla', 'comb', 'shrimp', 'siph', 'lantern', 'comb'][i % 6], s: 0.8 + hash1(i * 5) * 0.4})),
];

export const scene02: SceneFn = (t) => {
  const d = camDepth(t);
  const cy = d * K;
  const sway = Math.sin(t * 0.3) * 60;
  const c = breathe(cam(sway, cy, 1.0), t, 0.5);
  const floorD = 4330;
  return {
    depth: d,
    svg: (
      <Ocean cam={c} t={t} depth={d} surfaceY={0} floor={{y: floorD * K, kind: 'abyss'}} snow={1.1} specks={clamp((d - 400) / 600) * 1.6} schools={clamp(1 - d / 300)} warp={clamp(1 - d / 120)}>
        {FAUNA.map((f, i) => {
          const y = f.d * K + Math.sin(t * 0.4 + i) * 20;
          if (Math.abs(y - cy) > 900) return null;
          const x = f.x + Math.sin(t * 0.2 + i) * 40;
          switch (f.kind) {
            case 'jelly':
              return <Jellyfish key={i} x={x} y={y} s={f.s} t={t + i} hue={i % 2 ? '#d8e8ff' : '#e8d8ff'} glow={0.15} seed={i} />;
            case 'hatchet':
              return <Hatchetfish key={i} x={x + (t - 40) * 30 * (i % 3 ? 1 : -1)} y={y} s={f.s * 1.4} t={t + i} dir={i % 3 ? 1 : -1} />;
            case 'lantern':
              return <Lanternfish key={i} x={x + (t - 40) * 50 * (i % 4 ? -1 : 1)} y={y} scale={f.s} angle={i % 4 ? Math.PI : 0} t={t + i} />;
            case 'atolla':
              return <Atolla key={i} x={x} y={y} s={f.s} t={t + i} alarm={0.6} />;
            case 'comb':
              return <CombJelly key={i} x={x} y={y} s={f.s * 1.3} t={t + i} />;
            case 'shrimp':
              return <RedShrimp key={i} x={x - (t - 50) * 40} y={y} s={f.s * 1.6} t={t + i} dir={-1} />;
            default:
              return <Siphonophore key={i} x={x + 400} y={y} s={f.s} t={t + i} len={800} />;
          }
        })}
      </Ocean>
    ),
    overlay: (
      <>
        <DepthGauge k={win(t, 30.8, 79.5, 0.8)} depth={d} />
        {/* presión: flechas que comprimen una esfera */}
        {(() => {
          const k = win(t, 61.6, 69.8, 0.5);
          if (k < 0.01) return null;
          const sq = 1 - 0.18 * clamp((t - 62) / 3);
          return (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: k}}>
              <g transform="translate(560 470)">
                <ellipse rx={90 * sq} ry={90 * sq} fill="none" stroke="#bfe8ff" strokeWidth={4} />
                {Array.from({length: 12}, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  const r0 = 190 - 30 * Math.sin(t * 3 + i) * 0.3;
                  return <path key={i} d={`M${Math.cos(a) * r0},${Math.sin(a) * r0} L${Math.cos(a) * 112 * sq},${Math.sin(a) * 112 * sq}`} stroke="#ffd76a" strokeWidth={5} markerEnd="url(#arrP)" />;
                })}
                <defs>
                  <marker id="arrP" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#ffd76a" /></marker>
                </defs>
              </g>
              <text x={560} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#ffffff" stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke">+1 atmósfera cada 10 m</text>
              <text x={560} y={772} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#ffd76a" stroke="rgba(0,0,0,0.7)" strokeWidth={5} paintOrder="stroke">4.000 m ≈ 400 veces la presión de la superficie</text>
            </svg>
          );
        })()}
        <Title k={win(t, 70.4, 74.5, 0.5)} lines={['≈ 2–4 °C · ALIMENTO ESCASO']} size={44} top={150} color="#bfe8ff" />
        <Title k={win(t, 74.6, 79.2, 0.6)} lines={['LA VIDA SE HA TRANSFORMADO']} size={56} top={150} />
      </>
    ),
    grade: {vignette: 0.7},
  };
};
export const DEPTH_K = K;
export const _hash = hash1;
