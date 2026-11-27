// ESCENARIO Y EFECTOS
//  · Reef: arrecife somero en capas de profundidad — agua azul petróleo/turquesa con rayos de sol, siluetas lejanas
//    violeta oscuro, rocas con pequeñas cuevas, corales (abanicos, ramas, cerebros), algas animadas, cardúmenes,
//    arena con ondulaciones y cáusticas, partículas en suspensión y algas desenfocadas en primer plano.
//  · PreyFish: pez pequeño (presa) que puede quedar ATURDIDO (se ladea y deriva; sin violencia gráfica).
//  · Efectos del chasquido (VISUALIZACIÓN CIENTÍFICA, no a escala de tiempo real): chorro de agua, burbuja de
//    cavitación, onda de choque y un destello diminuto. Nunca fuego, rayos ni explosiones.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {Cam, layerT} from '../../../studio2';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export const PAL = {petrol: '#0d4a5e', turq: '#2aa8b0', emerald: '#1f8a6a', copper: '#d0743a', coral: '#e05a4a', gold: '#f0c870', violet: '#3a2a5a'};

/** Punto de la pinza mayor (coordenadas locales de la palma: dedo fijo hacia +x) → mundo. */
export function clawPt(sx: number, sy: number, scale: number, dir: 1 | -1, aim: number, px: number, py: number, angle = 0): V {
  const lx = 62 + px;
  const ly = 12 + py;
  const ca = Math.cos(aim);
  const sa = Math.sin(aim);
  const qx = (lx * ca - ly * sa + 30) * scale * dir;
  const qy = (lx * sa + ly * ca + 26) * scale;
  const cA = Math.cos(angle);
  const sA = Math.sin(angle);
  return {x: sx + qx * cA - qy * sA, y: sy + qx * sA + qy * cA};
}
/** Punto de salida del chorro (delante del dedo fijo), en coordenadas del mundo. */
export const clawTip = (sx: number, sy: number, scale: number, dir: 1 | -1, aim: number, angle = 0, ahead = 0): V => clawPt(sx, sy, scale, dir, aim, 178 + ahead, 8, angle);

const ROCKS = Array.from({length: 9}, (_, i) => ({x: -2600 + i * 640 + hash1(i * 13) * 220, w: 220 + hash1(i * 5) * 200, h: 120 + hash1(i * 7) * 170, cave: i % 3 === 1}));
const CORALS = Array.from({length: 16}, (_, i) => ({x: ((x) => (x > -300 && x < 1000 ? x + (x < 350 ? -520 : 560) : x))(-2500 + i * 330 + hash1(i * 31) * 160), kind: i % 4, h: 90 + hash1(i * 17) * 110, c: [PAL.coral, PAL.copper, '#c86ab0', PAL.gold][i % 4]}));
const ALGAE = Array.from({length: 22}, (_, i) => ({x: -2400 + i * 230 + hash1(i * 41) * 120, h: 80 + hash1(i * 43) * 120, c: i % 3 ? PAL.emerald : '#5aa04a'}));

export const Reef: React.FC<{cam: Cam; t: number; floorY?: number; children?: React.ReactNode; dim?: number; front?: boolean}> = ({cam, t, floorY = 500, children, dim = 0, front = true}) => {
  const z = cam.zoom;
  const k = `d${Math.round(dim * 100)}`;
  const top = mixColor('#3ab8c0', '#0a2030', dim);
  const mid = mixColor(PAL.petrol, '#061620', dim);
  const bot = mixColor('#08303e', '#020a10', dim);
  return (
    <g>
      <defs>
        <linearGradient id={`rfW${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <linearGradient id="rfRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8fff0" stopOpacity={0.5} />
          <stop offset="1" stopColor="#e8fff0" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`rfSand${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixColor('#d8c08a', '#2a2a30', dim * 0.8)} />
          <stop offset="1" stopColor={mixColor('#8a7a5a', '#101418', dim * 0.8)} />
        </linearGradient>
        <filter id="rfB1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6} /></filter>
        <filter id="rfB2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={14} /></filter>
        <filter id="rfRays" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={18} /></filter>
      </defs>
      <rect width={1080} height={1920} fill={`url(#rfW${k})`} />
      {/* rayos de sol (pantalla) */}
      <g filter="url(#rfRays)" opacity={0.55 * (1 - dim)} style={{mixBlendMode: 'screen'}}>
        {Array.from({length: 7}, (_, i) => {
          const x = 80 + i * 170 + Math.sin(t * 0.25 + i * 1.7) * 50 - cam.x * 0.05;
          const w = 40 + hash1(i * 3) * 70;
          return <path key={i} d={`M${f1(x)},-40 L${f1(x + w)},-40 L${f1(x + w * 2.4 + 260)},1500 L${f1(x + 220)},1500Z`} fill="url(#rfRay)" opacity={0.35 + 0.25 * Math.sin(t * 0.7 + i)} />;
        })}
      </g>
      {/* capa lejana: siluetas del arrecife */}
      <g transform={layerT(cam, 0.35)} filter="url(#rfB2)" opacity={1 - dim * 0.6}>
        <path d={`M${f1(cam.x * 0.35 - 3000)},${floorY * 0.35 + 900} ${Array.from({length: 30}, (_, i) => `L${f1(cam.x * 0.35 - 3000 + i * 210)},${f1(floorY * 0.35 + 120 - hash1(i * 3 + 1) * 160 - (i % 5 === 2 ? 120 : 0))}`).join(' ')} L${f1(cam.x * 0.35 + 3200)},${floorY * 0.35 + 900}Z`} fill={mixColor(PAL.violet, '#1a5a6a', 0.45)} opacity={0.7} />
      </g>
      {/* capa media: rocas, abanicos y cardumen */}
      <g transform={layerT(cam, 0.7)} filter="url(#rfB1)" opacity={1 - dim * 0.5}>
        <rect x={cam.x * 0.7 - 3000} y={floorY * 0.7 + 60} width={6000} height={2000} fill={mixColor('#5a6a5a', '#0a1a20', 0.5 + dim * 0.3)} />
        {ROCKS.map((r, i) => <path key={i} d={`M${f1(r.x * 0.8 - r.w * 0.6)},${f1(floorY * 0.7 + 70)} Q${f1(r.x * 0.8 - r.w * 0.5)},${f1(floorY * 0.7 - r.h * 0.9)} ${f1(r.x * 0.8)},${f1(floorY * 0.7 - r.h)} Q${f1(r.x * 0.8 + r.w * 0.6)},${f1(floorY * 0.7 - r.h * 0.6)} ${f1(r.x * 0.8 + r.w * 0.7)},${f1(floorY * 0.7 + 70)}Z`} fill={mixColor('#3a5a5a', PAL.violet, 0.3)} />)}
        {CORALS.filter((_, i) => i % 2).map((c, i) => (
          <g key={`fan${i}`} transform={`translate(${f1(c.x * 0.75)} ${f1(floorY * 0.7 + 40)})`} opacity={0.75}>
            {Array.from({length: 6}, (_, j) => <path key={j} d={`M0,0 q${f1((j - 2.5) * 20)},${f1(-c.h * 0.6)} ${f1((j - 2.5) * 34 + Math.sin(t * 0.6 + i + j) * 6)},${f1(-c.h * 1.3)}`} stroke={mixColor(c.c, '#2a4a5a', 0.45)} strokeWidth={6} fill="none" strokeLinecap="round" />)}
          </g>
        ))}
        {/* cardumen pequeño lejano */}
        {Array.from({length: 14}, (_, i) => {
          const sx = cam.x * 0.7 + ((i * 97 + t * 40) % 1600) - 800;
          const sy = floorY * 0.7 - 380 + Math.sin(t * 0.9 + i) * 30 + (i % 4) * 34;
          return <path key={`sf${i}`} d={`M${f1(sx)},${f1(sy)} q14,-6 26,0 q-12,6 -26,0z M${f1(sx)},${f1(sy)} l-8,-5 l0,10z`} fill="#bfe8f0" opacity={0.45} />;
        })}
      </g>
      {/* capa del suelo (mundo) */}
      <g transform={layerT(cam, 1)}>
        <path d={`M${f1(cam.x - 3000)},${floorY + 2400} L${f1(cam.x - 3000)},${floorY} ${Array.from({length: 61}, (_, i) => {
          const x = Math.floor(cam.x / 100) * 100 - 3000 + i * 100;
          return `L${x},${f1(floorY + Math.sin(x * 0.004) * 10 + Math.sin(x * 0.013) * 4)}`;
        }).join(' ')} L${f1(cam.x + 3100)},${floorY + 2400}Z`} fill={`url(#rfSand${k})`} />
        {/* ondulaciones de la arena */}
        {Array.from({length: 26}, (_, i) => {
          const x0 = Math.floor(cam.x / 260) * 260 - 1800 + (i % 13) * 280;
          const y0 = floorY + 40 + Math.floor(i / 13) * 90 + (i % 3) * 18;
          return <path key={`rp${i}`} d={`M${x0},${y0} q60,-12 120,0 t120,0`} stroke={mixColor('#b89a68', '#000', dim * 0.6)} strokeWidth={4} fill="none" opacity={0.55} />;
        })}
        {/* cáusticas sobre la arena */}
        <g style={{mixBlendMode: 'screen'}} opacity={0.32 * (1 - dim)}>
          {Array.from({length: 30}, (_, i) => {
            const x = Math.floor(cam.x / 200) * 200 - 1500 + (i % 15) * 200 + Math.sin(t * 0.8 + i * 1.3) * 40;
            const y = floorY + 20 + Math.floor(i / 15) * 110 + Math.cos(t * 0.6 + i) * 14;
            return <ellipse key={`ca${i}`} cx={x} cy={y} rx={60 + Math.sin(t + i) * 18} ry={12} fill="#fff8d0" />;
          })}
        </g>
        {/* rocas con cuevas */}
        {ROCKS.map((r, i) => (
          <g key={`rk${i}`}>
            <path d={`M${f1(r.x - r.w * 0.6)},${floorY + 14} Q${f1(r.x - r.w * 0.58)},${f1(floorY - r.h * 0.85)} ${f1(r.x - r.w * 0.1)},${f1(floorY - r.h)} Q${f1(r.x + r.w * 0.5)},${f1(floorY - r.h * 0.95)} ${f1(r.x + r.w * 0.62)},${floorY + 14}Z`} fill={mixColor(i % 2 ? '#6a6458' : '#5a5a52', '#0a1014', dim * 0.7)} stroke="#2a2a26" strokeWidth={3} />
            <path d={`M${f1(r.x - r.w * 0.45)},${f1(floorY - r.h * 0.6)} Q${f1(r.x - r.w * 0.1)},${f1(floorY - r.h * 0.95)} ${f1(r.x + r.w * 0.3)},${f1(floorY - r.h * 0.8)}`} stroke="#a8a090" strokeWidth={8} fill="none" opacity={0.35} />
            {r.cave && <path d={`M${f1(r.x - r.w * 0.22)},${floorY + 12} Q${f1(r.x - r.w * 0.2)},${f1(floorY - r.h * 0.42)} ${f1(r.x + r.w * 0.05)},${f1(floorY - r.h * 0.44)} Q${f1(r.x + r.w * 0.28)},${f1(floorY - r.h * 0.38)} ${f1(r.x + r.w * 0.3)},${floorY + 12}Z`} fill="#0a1418" opacity={0.9} />}
            {Array.from({length: 5}, (_, j) => <circle key={j} cx={r.x - r.w * 0.4 + j * r.w * 0.2} cy={floorY - r.h * (0.3 + hash1(i * 5 + j) * 0.5)} r={6 + hash1(i + j * 3) * 8} fill={['#c86ab0', PAL.coral, '#e8a050'][j % 3]} opacity={0.6} />)}
          </g>
        ))}
        {/* corales */}
        {CORALS.map((c, i) => {
          const x = c.x;
          const col = mixColor(c.c, '#0a1014', dim * 0.7);
          if (c.kind === 0)
            return (
              <g key={`co${i}`}>
                {Array.from({length: 7}, (_, j) => <path key={j} d={`M${f1(x)},${floorY + 6} q${f1((j - 3) * 14)},${f1(-c.h * 0.5)} ${f1((j - 3) * 26 + Math.sin(t * 0.9 + i + j) * 3)},${f1(-c.h)}`} stroke={col} strokeWidth={13 - Math.abs(j - 3) * 2} strokeLinecap="round" fill="none" />)}
              </g>
            );
          if (c.kind === 1) return <g key={`co${i}`}><ellipse cx={x} cy={floorY - 10} rx={c.h * 0.55} ry={c.h * 0.36} fill={col} stroke="#5a2a1a" strokeWidth={2} />{Array.from({length: 5}, (_, j) => <path key={j} d={`M${f1(x - c.h * 0.45)},${f1(floorY - 20 - j * 10)} q${f1(c.h * 0.2)},-12 ${f1(c.h * 0.45)},0 t${f1(c.h * 0.45)},0`} stroke="#8a3a2a" strokeWidth={3} fill="none" opacity={0.6} />)}</g>;
          if (c.kind === 2)
            return (
              <g key={`co${i}`}>
                {Array.from({length: 12}, (_, j) => {
                  const a = -Math.PI / 2 + (j - 5.5) * 0.16 + Math.sin(t * 1.4 + j) * 0.08;
                  return <path key={j} d={`M${f1(x)},${floorY - 6} q${f1(Math.cos(a) * c.h * 0.4)},${f1(Math.sin(a) * c.h * 0.3)} ${f1(Math.cos(a) * c.h * 0.7)},${f1(Math.sin(a) * c.h * 0.7)}`} stroke={col} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.9} />;
                })}
                <ellipse cx={x} cy={floorY - 4} rx={22} ry={10} fill="#7a3a5a" />
              </g>
            );
          return <g key={`co${i}`}>{Array.from({length: 4}, (_, j) => <path key={j} d={`M${f1(x + j * 18 - 27)},${floorY + 4} l${f1(Math.sin(j) * 6)},${f1(-c.h * (0.5 + hash1(i + j) * 0.5))}`} stroke={col} strokeWidth={16} strokeLinecap="round" />)}</g>;
        })}
        {/* algas animadas */}
        {ALGAE.map((a, i) => (
          <g key={`al${i}`}>
            {Array.from({length: 3}, (_, j) => {
              const sw = Math.sin(t * 1.1 + i * 0.7 + j) * 18;
              return <path key={j} d={`M${f1(a.x + j * 10)},${floorY + 8} C${f1(a.x + j * 10 + sw * 0.3)},${f1(floorY - a.h * 0.35)} ${f1(a.x + j * 10 - sw * 0.5)},${f1(floorY - a.h * 0.7)} ${f1(a.x + j * 10 + sw)},${f1(floorY - a.h)}`} stroke={mixColor(a.c, '#061014', dim * 0.7)} strokeWidth={9 - j * 2} strokeLinecap="round" fill="none" />;
            })}
          </g>
        ))}
        {/* conchas y guijarros */}
        {Array.from({length: 30}, (_, i) => <ellipse key={`pb${i}`} cx={-2400 + hash1(i * 61) * 4800} cy={floorY + 18 + hash1(i * 67) * 150} rx={6 + hash1(i * 3) * 10} ry={4 + hash1(i * 5) * 5} fill={i % 3 ? '#a89a7a' : '#e8d8c0'} opacity={0.8} />)}
        {children}
      </g>
      {/* partículas en suspensión */}
      <g transform={layerT(cam, 1.15)} opacity={0.7 * clamp((6 - z) / 2.5)}>
        {Array.from({length: 40}, (_, i) => {
          const x = cam.x * 1.15 + ((hash1(i * 7) * 2400 + t * 14 * (0.4 + hash1(i))) % 2400) - 1200;
          const y = cam.y * 1.15 + ((hash1(i * 11) * 2600 - t * 10 + 2600 * 4) % 2600) - 1300;
          return <circle key={i} cx={x} cy={y} r={(1.4 + hash1(i * 3) * 2.4) / Math.pow(z, 0.15)} fill="#e8fff8" opacity={0.55} />;
        })}
      </g>
      {/* primer plano desenfocado */}
      {front && (
        <g transform={layerT(cam, 1.4)} filter="url(#rfB2)" opacity={0.5 * (1 - dim * 0.5)}>
          {[-1, 1].map((s) => (
            <g key={s}>
              {Array.from({length: 3}, (_, j) => {
                const bx = cam.x * 1.4 + s * (600 / Math.pow(z, 1.4)) + j * 40 * s;
                const by = floorY * 1.4 + 400;
                const sw = Math.sin(t * 0.9 + j + s) * 30;
                return <path key={j} d={`M${f1(bx)},${f1(by)} C${f1(bx + sw)},${f1(by - 300)} ${f1(bx - sw)},${f1(by - 600)} ${f1(bx + sw * 1.5)},${f1(by - 900 - j * 120)}`} stroke={j % 2 ? '#1a6a4a' : '#2a7a3a'} strokeWidth={22 - j * 5} fill="none" strokeLinecap="round" />;
              })}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

/** Pez pequeño (presa). `stun` 0…1: se ladea, las aletas se detienen y deriva hacia el fondo. */
export const PreyFish: React.FC<{x: number; y: number; t: number; scale?: number; dir?: 1 | -1; stun?: number; flinch?: number}> = ({x, y, t, scale = 1, dir = 1, stun = 0, flinch = 0}) => {
  const beat = Math.sin(t * (9 - stun * 8)) * (1 - stun * 0.85);
  const roll = stun * 0.9 + Math.sin(t * 2) * 0.08 * stun - flinch * 0.4;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((roll * 180) / Math.PI)}) scale(${f1(scale * dir)} ${f1(scale)})`}>
      <path d={`M-52,0 L${f1(-82)},${f1(-18 + beat * 8)} L${f1(-80)},${f1(18 + beat * 8)}Z`} fill="#8ac0d8" stroke="#2a4a5a" strokeWidth={1.5} />
      <path d="M58,0 Q40,-24 -10,-22 Q-46,-18 -56,0 Q-46,16 -10,20 Q40,22 58,0Z" fill="#cfe4ec" stroke="#2a4a5a" strokeWidth={2} />
      <path d="M50,-4 Q10,-14 -48,-4" stroke="#f0c040" strokeWidth={5} fill="none" opacity={0.85} />
      <path d="M40,8 Q0,14 -44,6" stroke="#ffffff" strokeWidth={4} fill="none" opacity={0.5} />
      <path d={`M-4,-21 Q-14,${f1(-38 + beat * 4)} -36,-18`} fill="#8ac0d8" stroke="#2a4a5a" strokeWidth={1.4} />
      <path d={`M14,6 q-8,${f1(10 + beat * 6)} -20,8`} fill="#8ac0d8" opacity={0.8} />
      <circle cx={38} cy={-4} r={6.5} fill="#ffffff" />
      <circle cx={39} cy={-4} r={3.6} fill="#0a1418" />
      {stun > 0.2 && <path d="M30,8 q6,4 12,0" stroke="#2a4a5a" strokeWidth={1.6} fill="none" />}
    </g>
  );
};

/** Chorro de agua: líneas de corriente que salen del dedo fijo. u 0…1 = avance. */
export const JetFX: React.FC<{o: V; dir: number; u: number; len?: number; k?: number}> = ({o, dir, u, len = 260, k = 1}) => {
  if (u <= 0 || u >= 1.6 || k <= 0.01) return null;
  const L = len * clamp(u);
  const fade = clamp((1.6 - u) / 0.6) * k;
  return (
    <g opacity={fade}>
      {Array.from({length: 7}, (_, i) => {
        const dy = (i - 3) * 7;
        const l = L * (0.7 + hash1(i * 3) * 0.3);
        return <path key={i} d={`M${f1(o.x)},${f1(o.y + dy * 0.3)} q${f1(dir * l * 0.5)},${f1(dy + Math.sin(i + u * 6) * 4)} ${f1(dir * l)},${f1(dy * 1.8)}`} stroke={i === 3 ? '#ffffff' : '#bff4ff'} strokeWidth={i === 3 ? 4 : 2.4} fill="none" strokeLinecap="round" opacity={0.75} />;
      })}
      <ellipse cx={o.x + dir * L * 0.5} cy={o.y} rx={L * 0.5} ry={10 + L * 0.04} fill="#bff4ff" opacity={0.12} />
    </g>
  );
};

/** Burbuja de cavitación (vacío de vapor de agua) con borde refractivo. */
export const BubbleFX: React.FC<{c: V; r: number; k?: number; squash?: number; id?: string}> = ({c, r, k = 1, squash = 0, id = 'cb'}) => {
  if (r <= 0.3 || k <= 0.01) return null;
  return (
    <g opacity={k}>
      <defs>
        <radialGradient id={`${id}G`} cx="0.42" cy="0.38" r="0.62">
          <stop offset="0" stopColor="#0a2a3a" stopOpacity={0.15} />
          <stop offset="0.72" stopColor="#5ad8f0" stopOpacity={0.12} />
          <stop offset="0.92" stopColor="#e8ffff" stopOpacity={0.85} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.15} />
        </radialGradient>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={r * (1.12 + squash * 0.2)} ry={r * (0.9 - squash * 0.2)} fill={`url(#${id}G)`} stroke="#e8ffff" strokeWidth={Math.max(1, r * 0.04)} />
      <ellipse cx={c.x - r * 0.35} cy={c.y - r * 0.38} rx={r * 0.26} ry={r * 0.13} fill="#ffffff" opacity={0.7} transform={`rotate(-25 ${f1(c.x - r * 0.35)} ${f1(c.y - r * 0.38)})`} />
      <ellipse cx={c.x + r * 0.3} cy={c.y + r * 0.42} rx={r * 0.32} ry={r * 0.08} fill="#ffffff" opacity={0.25} />
    </g>
  );
};

/** Onda de choque: anillos de presión que se expanden y se debilitan. u ≥ 0. */
export const ShockFX: React.FC<{c: V; u: number; R?: number; k?: number; sw?: number}> = ({c, u, R = 700, k = 1, sw = 1}) => {
  if (u <= 0 || u > 1.2 || k <= 0.01) return null;
  return (
    <g>
      {[0, 0.12, 0.26].map((d, i) => {
        const v = clamp(u - d);
        if (v <= 0) return null;
        const r = R * (1 - Math.pow(1 - v, 2.2));
        const a = (1 - v) * (i === 0 ? 1 : 0.55) * k;
        return (
          <g key={i} opacity={a}>
            <circle cx={c.x} cy={c.y} r={r} fill="none" stroke="#ffffff" strokeWidth={Math.max(1.5 * sw, 14 * sw * (1 - v))} />
            <circle cx={c.x} cy={c.y} r={r * 0.96} fill="none" stroke="#062030" strokeWidth={Math.max(sw, 8 * sw * (1 - v))} opacity={0.35} />
            <circle cx={c.x} cy={c.y} r={r * 1.04} fill="none" stroke="#9ff4ff" strokeWidth={Math.max(sw, 6 * sw * (1 - v))} opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};

/** Destello diminuto (sonoluminiscencia, ilustrativo): un punto brillante de muy corta duración. */
export const FlashFX: React.FC<{c: V; k: number; size?: number}> = ({c, k, size = 14}) =>
  k > 0.01 ? (
    <g opacity={k} style={{mixBlendMode: 'screen'}}>
      <circle cx={c.x} cy={c.y} r={size * 2.4} fill="#bfe8ff" opacity={0.25} />
      <circle cx={c.x} cy={c.y} r={size} fill="#eaf6ff" opacity={0.8} />
      <circle cx={c.x} cy={c.y} r={size * 0.35} fill="#ffffff" />
      <path d={`M${f1(c.x - size * 3)},${f1(c.y)} L${f1(c.x + size * 3)},${f1(c.y)} M${f1(c.x)},${f1(c.y - size * 3)} L${f1(c.x)},${f1(c.y + size * 3)}`} stroke="#ffffff" strokeWidth={size * 0.12} opacity={0.6} />
    </g>
  ) : null;

/** Nube de partículas levantadas por la onda. */
export const StirFX: React.FC<{c: V; u: number; n?: number; R?: number; pr?: number}> = ({c, u, n = 18, R = 160, pr = 1}) => {
  if (u <= 0 || u > 1.5) return null;
  return (
    <g opacity={clamp((1.5 - u) / 0.8)}>
      {Array.from({length: n}, (_, i) => {
        const a = hash1(i * 7) * Math.PI * 2;
        const d = R * Math.pow(clamp(u), 0.5) * (0.4 + hash1(i * 3) * 0.8);
        return <circle key={i} cx={c.x + Math.cos(a) * d} cy={c.y + Math.sin(a) * d * 0.7 + u * 20} r={(2 + hash1(i) * 3) * pr} fill="#e8f8f0" opacity={0.7} />;
      })}
    </g>
  );
};

/** Zona de baja presión (visualización). */
export const LowPressure: React.FC<{c: V; r: number; k: number}> = ({c, r, k}) =>
  k > 0.01 ? (
    <g opacity={k}>
      <defs>
        <radialGradient id="lpG">
          <stop offset="0" stopColor="#3a6aff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#3a6aff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={c.x} cy={c.y} rx={r * 1.4} ry={r} fill="url(#lpG)" />
    </g>
  ) : null;

export const lerpV = (a: V, b: V, u: number): V => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)});
