// PERSONAJE ÚNICO DEL CICLO DE VIDA (Bufo bufo): UN SOLO RIG que pasa de renacuajo a sapo adulto.
// Vista lateral, cabeza hacia +x. Todas las partes dependen de los parámetros de etapa interpolados:
//  · cuerpo: perfil de 13 puntos interpolado entre la silueta de renacuajo y la de sapo (spline cerrada),
//    con volumen calculado (filtro de relieve sin bandas), vientre claro, motas doradas (renacuajo) y,
//    al avanzar, manchas, verrugas irregulares y glándulas parotoides;
//  · cola: columna de 14 puntos de control con onda progresiva, músculo y aletas translúcidas; se
//    acorta y adelgaza al reabsorberse (nunca desaparece de golpe);
//  · patas posteriores y anteriores articuladas (muslo-pierna-pie / brazo-antebrazo-mano), que nacen
//    como esbozos y crecen; poses de nado, reposo y salto interpoladas;
//  · cabeza: boca (disco oral → boca ancha), narina, branquias externas del recién eclosionado,
//    ojo que pasa de punto oscuro a ojo prominente con iris cobrizo y pupila horizontal, parpadeo;
//  · respiración: pulsación de la garganta y del flanco.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';
import {closedSpline, lerpPoly, Pt} from '../../../lifecycle/stages';
import {VolumeFilter} from '../../oarfish-cinematic-v2/character/filters';
import {ToadParams} from '../species/bufoBufo';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const P = (x: number, y: number): Pt => ({x, y});

// Siluetas de referencia (13 puntos, sentido horario desde el hocico).
const TADPOLE: Pt[] = [P(52, 0), P(47, -17), P(31, -29), P(9, -35), P(-14, -34), P(-34, -25), P(-46, -11), P(-50, 3), P(-42, 17), P(-24, 27), P(0, 31), P(26, 27), P(43, 15)];
const TOAD: Pt[] = [P(104, 10), P(100, -8), P(84, -26), P(58, -40), P(24, -52), P(-18, -60), P(-56, -54), P(-84, -36), P(-98, -10), P(-92, 18), P(-62, 36), P(-12, 44), P(46, 36)];

export type ToadPose = {
  x: number;
  y: number;
  scale: number; // escala de mundo
  angle: number; // inclinación (rad)
  t: number;
  swimPhase: number;
  swimAmp: number; // 0 … 1
  curl: number; // cola enrollada (embrión que eclosiona)
  fold: number; // patas posteriores: 0 extendidas … 1 plegadas (reposo)
  armReach: number; // brazos hacia delante (vuelo/aterrizaje)
  crouch: number; // compresión del cuerpo
  breath: number; // respiración 0…1
  blink: number; // 0 abierto … 1 cerrado
  inWater: boolean;
  light: number;
};

export const toadPose = (o: Partial<ToadPose> = {}): ToadPose => ({x: 0, y: 0, scale: 1, angle: 0, t: 0, swimPhase: 0, swimAmp: 0.6, curl: 0, fold: 1, armReach: 0, crouch: 0, breath: 0, blink: 0, inWater: true, light: 1, ...o});

const taperPath = (pts: Pt[], w0: number, w1: number) => {
  const n = pts.length;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push(P(pts[i].x - (dy / l) * w, pts[i].y + (dx / l) * w));
    R.push(P(pts[i].x + (dy / l) * w, pts[i].y - (dx / l) * w));
  }
  return `M${L.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} L${R.reverse().map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')}Z`;
};

/** Pata articulada: cadena de segmentos (ángulos absolutos en grados) desde la cadera/hombro. */
function limb(hip: Pt, segs: {len: number; deg: number; w0: number; w1: number}[], toes: number, toeLen: number) {
  let p = hip;
  const paths: string[] = [];
  const joints: Pt[] = [hip];
  for (const s of segs) {
    const a = (s.deg * Math.PI) / 180;
    const q = P(p.x + Math.cos(a) * s.len, p.y + Math.sin(a) * s.len);
    const mid = P((p.x + q.x) / 2 + Math.sin(a) * s.len * 0.06, (p.y + q.y) / 2 - Math.cos(a) * s.len * 0.06);
    paths.push(taperPath([p, mid, q], s.w0, s.w1));
    p = q;
    joints.push(q);
  }
  const last = segs[segs.length - 1];
  const a = (last.deg * Math.PI) / 180;
  for (let i = 0; i < toes; i++) {
    const ta = a + (i - (toes - 1) / 2) * 0.22;
    const tip = P(p.x + Math.cos(ta) * toeLen * (1 - Math.abs(i - (toes - 1) / 2) * 0.12), p.y + Math.sin(ta) * toeLen * (1 - Math.abs(i - (toes - 1) / 2) * 0.12));
    paths.push(taperPath([p, P((p.x + tip.x) / 2, (p.y + tip.y) / 2), tip], last.w1 * 0.55, 1.4));
  }
  return {paths, joints};
}

export const Toad: React.FC<{s: ToadParams; p: ToadPose; uid: string}> = ({s, p, uid}) => {
  const k = clamp(s.toad);
  const base = lerpPoly(TADPOLE, TOAD, k);
  // respiración: la garganta (puntos inferiores de la cabeza) pulsa; el flanco se ensancha apenas
  const throat = p.breath * (0.3 + 0.7 * k);
  const crouchY = 1 - 0.12 * p.crouch;
  const poly = base.map((q, i) => P(q.x * (1 + 0.04 * p.crouch), (q.y + (i === 11 || i === 12 ? throat * 7 : i === 10 ? throat * 3 : 0) + (i >= 8 && i <= 10 ? p.breath * 1.5 * k : 0)) * crouchY));
  const body = closedSpline(poly, 1);
  const back = mixColor('#2a221d', '#6d4a2a', s.pigment);
  const backDark = mixColor('#15100d', '#3a2414', s.pigment);
  const belly = mixColor('#5a4a3a', '#d8c296', s.pigment);
  const limbCol = mixColor('#3a3028', '#76522e', s.pigment);
  const limbFar = mixColor('#1e1814', '#4a321c', s.pigment);
  // cola
  const tailOn = s.tail > 0.01;
  const anchor = P(lerp(-44, -90, k), lerp(3, -2, k) * crouchY);
  const L = 175 * s.tail;
  const amp = 22 * p.swimAmp * (0.45 + 0.55 * s.tail);
  const spine: Pt[] = Array.from({length: 14}, (_, i) => {
    const u = i / 13;
    const wave = amp * Math.pow(u, 1.4) * Math.sin(p.swimPhase - u * Math.PI * 2 * 1.05);
    const curl = p.curl * Math.sin(u * Math.PI * 0.9) * 70 * u;
    return P(anchor.x - u * L * (1 - 0.35 * p.curl), anchor.y + wave + curl - u * 4);
  });
  const nrm = spine.map((_, i) => {
    const a = spine[Math.max(0, i - 1)];
    const b = spine[Math.min(13, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return P(dy / l, -dx / l);
  });
  const w0 = 24 * (0.35 + 0.65 * s.tail);
  const mw = (u: number) => w0 * Math.pow(1 - u, 0.8) + 1.2;
  const finUp = (u: number) => 22 * s.tail * Math.sin(Math.PI * clamp(u * 1.12 + 0.05)) * (1 - 0.15 * u);
  const finLo = (u: number) => 15 * s.tail * Math.sin(Math.PI * clamp(u * 1.1 + 0.08));
  const off = (sign: number, fn: (u: number) => number) => spine.map((q, i) => {
    const u = i / 13;
    const h = mw(u) / 2 + fn(u);
    return P(q.x - nrm[i].x * h * sign, q.y - nrm[i].y * h * sign);
  });
  const finTop = off(1, finUp);
  const finBot = off(-1, finLo);
  const finPath = `M${finTop.map((q) => `${f1(q.x)},${f1(q.y)}`).join(' L')} L${f1(spine[13].x - 6)},${f1(spine[13].y)} L${finBot.reverse().map((q) => `${f1(q.x)},${f1(q.y)}`).join(' L')}Z`;
  const muscle = off(1, () => 0);
  const muscleB = off(-1, () => 0);
  const musclePath = `M${muscle.map((q) => `${f1(q.x)},${f1(q.y)}`).join(' L')} L${muscleB.reverse().map((q) => `${f1(q.x)},${f1(q.y)}`).join(' L')}Z`;
  let veins = '';
  for (let i = 2; i < 13; i += 2) veins += `M${f1(spine[i].x)},${f1(spine[i].y)} L${f1(finTop[i].x)},${f1(finTop[i].y)} M${f1(spine[i].x)},${f1(spine[i].y)} L${f1(finBot[13 - i].x)},${f1(finBot[13 - i].y)} `;
  // patas
  const hindK = clamp((s.hind - 0.18) / 0.82) * lerp(0.55, 1, k);
  const bud = s.hind > 0.01 && s.hind < 0.4;
  const hip = P(lerp(-30, -58, k), lerp(17, 18, k) * crouchY);
  const kick = p.inWater ? Math.sin(p.t * 3.1) * 0.12 : 0;
  const fold = clamp(p.fold + kick);
  const hindSegs = (far: boolean) => [
    {len: 64 * hindK, deg: lerp(165, 28, fold) + (far ? -6 : 0), w0: 30 * hindK + 2, w1: 18 * hindK + 1.5},
    {len: 60 * hindK, deg: lerp(175, 168, fold) + (far ? 4 : 0), w0: 17 * hindK + 1.5, w1: 11 * hindK + 1},
    {len: 34 * hindK, deg: lerp(182, 4, fold), w0: 10 * hindK + 1, w1: 8 * hindK + 1},
  ];
  const foreK = clamp((s.fore - 0.1) / 0.9) * lerp(0.7, 1, k);
  const sh = P(lerp(30, 46, k), lerp(20, 24, k) * crouchY);
  const foreSegs = (far: boolean) => [
    {len: 34 * foreK, deg: lerp(lerp(140, 112, k), 40, p.armReach) + (far ? 8 : 0), w0: 17 * foreK + 1, w1: 12 * foreK + 1},
    {len: 32 * foreK, deg: lerp(lerp(150, 70, k), 18, p.armReach) + (far ? 6 : 0), w0: 12 * foreK + 1, w1: 9 * foreK + 1},
    {len: 14 * foreK, deg: lerp(lerp(160, 4, k), 10, p.armReach), w0: 9 * foreK + 1, w1: 7 * foreK + 1},
  ];
  const hindNear = limb(hip, hindSegs(false), 5, 26 * hindK);
  const hindFar = limb(P(hip.x + 6, hip.y - 4), hindSegs(true), 5, 24 * hindK);
  const foreNear = limb(sh, foreSegs(false), 4, 16 * foreK);
  const foreFar = limb(P(sh.x + 8, sh.y - 3), foreSegs(true), 4, 14 * foreK);
  // ojo
  const eye = P(lerp(31, 62, k), lerp(-13, -40, k) * crouchY);
  const er = lerp(5, 15, s.eyeBulge);
  const iris = mixColor('#1a1410', '#c4832e', s.eyeBulge);
  // verrugas y manchas (en coordenadas de sapo, mapeadas a la silueta actual)
  const wartN = Math.round(70 * s.warts);
  let warts = '';
  let wartHi = '';
  for (let i = 0; i < wartN; i++) {
    const wx = lerp(-88, 70, hash1(i * 3.1));
    const wy = lerp(-58, 18, Math.pow(hash1(i * 5.3), 1.4));
    const sc = lerp(0.5, 1, k);
    const cx = wx * sc;
    const cy = wy * sc * crouchY;
    const r = (2.4 + hash1(i * 7.7) * 4.2) * (0.5 + 0.5 * s.warts) * (wy < -20 ? 1.15 : 0.8);
    warts += 'M' + Array.from({length: 7}, (_, q) => {
      const a = (q / 7) * Math.PI * 2;
      const rr = r * (0.75 + 0.4 * hash1(i * 11 + q));
      return `${f1(cx + Math.cos(a) * rr * 1.15)},${f1(cy + Math.sin(a) * rr)}`;
    }).join(' L') + 'Z ';
    wartHi += `M${f1(cx - r * 0.5)},${f1(cy - r * 0.35)} q${f1(r * 0.4)},${f1(-r * 0.4)} ${f1(r * 0.8)},${f1(-r * 0.1)} `;
  }
  let spots = '';
  const spotN = Math.round(18 * clamp((s.pigment - 0.3) / 0.7));
  for (let i = 0; i < spotN; i++) {
    const cx = lerp(-80, 50, hash1(i * 13.1)) * lerp(0.5, 1, k);
    const cy = lerp(-50, 8, hash1(i * 17.3)) * lerp(0.5, 1, k) * crouchY;
    const r = 4 + hash1(i * 2.9) * 7;
    spots += 'M' + Array.from({length: 8}, (_, q) => {
      const a = (q / 8) * Math.PI * 2;
      const rr = r * (0.6 + 0.6 * hash1(i * 19 + q));
      return `${f1(cx + Math.cos(a) * rr * 1.3)},${f1(cy + Math.sin(a) * rr)}`;
    }).join(' L') + 'Z ';
  }
  let flecks = '';
  for (let i = 0; i < 26 * (1 - k); i++) flecks += `M${f1(lerp(-40, 40, hash1(i * 23)))},${f1(lerp(-28, 22, hash1(i * 29)))} l1.6,0 `;
  const T = `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1((p.angle * 180) / Math.PI)}) scale(${(p.scale * s.size).toFixed(4)})`;
  return (
    <g transform={T}>
      <defs>
        <VolumeFilter id={`tv-${uid}`} relief={lerp(7, 13, k)} spec={0.5} />
        <VolumeFilter id={`tl-${uid}`} relief={3.2} spec={0.45} />
        <linearGradient id={`tb-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={backDark} />
          <stop offset="0.35" stopColor={back} />
          <stop offset="0.7" stopColor={mixColor(back, belly, 0.5)} />
          <stop offset="1" stopColor={belly} />
        </linearGradient>
        <radialGradient id={`ti-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={mixColor(iris, '#ffd890', 0.25 * s.eyeBulge)} />
          <stop offset="0.75" stopColor={iris} />
          <stop offset="1" stopColor={mixColor(iris, '#000', 0.5)} />
        </radialGradient>
        <clipPath id={`tc-${uid}`}>
          <path d={body} />
        </clipPath>
      </defs>
      {/* aletas de la cola y músculo (detrás del cuerpo) */}
      {tailOn && (
        <g>
          <path d={finPath} fill={mixColor('#8a7048', '#a08a60', s.pigment)} opacity={0.42 * (0.4 + 0.6 * s.tail)} />
          <path d={veins} stroke="#d8c08a" strokeWidth={0.6} opacity={0.25} />
          <g filter={`url(#tv-${uid})`}>
            <path d={musclePath} fill={mixColor('#2a221d', '#6a5034', s.pigment)} />
          </g>
          <path d={finTop.map((q, i) => `${i ? 'L' : 'M'}${f1(q.x)},${f1(q.y)}`).join(' ')} stroke="#e8d8a8" strokeWidth={0.8} fill="none" opacity={0.35 * p.light} />
        </g>
      )}
      {/* patas del lado lejano */}
      {hindK > 0.02 && hindFar.paths.map((d, i) => <path key={`hf${i}`} d={d} fill={limbFar} />)}
      {foreK > 0.02 && foreFar.paths.map((d, i) => <path key={`ff${i}`} d={d} fill={limbFar} />)}
      {/* cuerpo con volumen */}
      <g filter={`url(#tv-${uid})`}>
        <path d={body} fill={`url(#tb-${uid})`} />
      </g>
      <g clipPath={`url(#tc-${uid})`}>
        <path d={flecks} stroke="#c8a860" strokeWidth={1.4} strokeLinecap="round" opacity={0.5 * (1 - k)} />
        <path d={spots} fill={backDark} opacity={0.55} />
        {wartN > 0 && (
          <g>
            <path d={warts} fill={backDark} opacity={0.5} transform="translate(1 1.6)" />
            <path d={warts} fill={mixColor(back, '#a07a48', 0.45)} stroke={backDark} strokeWidth={0.6} opacity={0.95} />
            <path d={wartHi} stroke="#f0dcb0" strokeWidth={1} fill="none" opacity={0.45 * p.light} strokeLinecap="round" />
          </g>
        )}
        {/* glándula parotoide (alargada, con poros) */}
        {s.parotoid > 0.01 && (
          <g opacity={s.parotoid}>
            <path d={`M${f1(28)},${f1(-52 * crouchY)} C40,${f1(-64 * crouchY)} 62,${f1(-62 * crouchY)} 70,${f1(-52 * crouchY)} C60,${f1(-46 * crouchY)} 40,${f1(-44 * crouchY)} 28,${f1(-52 * crouchY)}Z`} fill={mixColor(back, '#b08a58', 0.5)} stroke={backDark} strokeWidth={1} />
            {Array.from({length: 7}, (_, i) => <circle key={i} cx={34 + i * 5} cy={(-54 + (i % 2) * 3) * crouchY} r={0.9} fill={backDark} />)}
          </g>
        )}
        <path d={body} fill="none" stroke="#ffffff" strokeWidth={2.2} opacity={0.12 * p.light} transform="translate(-1 -2)" />
      </g>
      {/* boca: disco oral (renacuajo) → boca ancha (sapo) */}
      {k < 0.5 && <path d={`M${f1(lerp(48, 70, k))},${f1(lerp(6, 10, k))} q3,3 0,6`} stroke="#0c0806" strokeWidth={2} fill="none" opacity={1 - k * 2} />}
      {k > 0.3 && <path d={`M${f1(lerp(70, 98, k))},${f1(9 * crouchY)} C${f1(lerp(60, 82, k))},${f1(13 * crouchY)} ${f1(lerp(40, 58, k))},${f1(12 * crouchY)} ${f1(lerp(28, 38, k))},${f1(6 * crouchY)}`} stroke={backDark} strokeWidth={2.2} fill="none" opacity={clamp((k - 0.3) / 0.4)} />}
      {k > 0.5 && <ellipse cx={lerp(80, 90, k)} cy={-11 * crouchY} rx={1.6} ry={1.1} fill="#0c0806" opacity={clamp((k - 0.5) * 2)} />}
      {/* branquias externas del recién eclosionado */}
      {s.gills > 0.02 && (
        <g opacity={s.gills}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${12 - i * 4},${-22 + i * 3} q-6,-10 -14,${f1(-8 - Math.sin(p.t * 4 + i) * 2)}`} stroke="#c87a5a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* ojo */}
      <g transform={`translate(${f1(eye.x)} ${f1(eye.y)})`}>
        {s.eyeBulge > 0.05 && <path d={`M${f1(-er * 1.5)},${f1(er * 0.4)} C${f1(-er * 1.4)},${f1(-er * 1.3)} ${f1(er * 1.4)},${f1(-er * 1.4)} ${f1(er * 1.5)},${f1(er * 0.4)}Z`} fill={back} opacity={s.eyeBulge} filter={`url(#tv-${uid})`} />}
        <ellipse rx={er} ry={er * 0.92} fill={`url(#ti-${uid})`} stroke="#120c08" strokeWidth={1} />
        {s.eyeBulge > 0.2 && (
          <g opacity={s.eyeBulge}>
            {Array.from({length: 10}, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <path key={i} d={`M${f1(Math.cos(a) * er * 0.45)},${f1(Math.sin(a) * er * 0.45)} L${f1(Math.cos(a + 0.2) * er * 0.92)},${f1(Math.sin(a + 0.2) * er * 0.86)}`} stroke="#6a3a14" strokeWidth={0.6} opacity={0.7} />;
            })}
            <ellipse rx={er * 0.55} ry={er * 0.22} fill="#050302" />
          </g>
        )}
        {s.eyeBulge <= 0.2 && <ellipse rx={er * 0.55} ry={er * 0.5} fill="#050302" />}
        <path d={`M${f1(-er * 0.45)},${f1(-er * 0.5)} q${f1(er * 0.3)},${f1(-er * 0.25)} ${f1(er * 0.6)},${f1(-er * 0.1)}`} stroke="#ffffff" strokeWidth={Math.max(0.8, er * 0.12)} strokeLinecap="round" opacity={0.85} />
        {p.blink > 0.02 && <path d={`M${f1(-er * 1.05)},0 C${f1(-er)},${f1(-er * 1.1 + p.blink * er * 1.9)} ${f1(er)},${f1(-er * 1.1 + p.blink * er * 1.9)} ${f1(er * 1.05)},0 C${f1(er)},${f1(-er * 1.2)} ${f1(-er)},${f1(-er * 1.2)} ${f1(-er * 1.05)},0Z`} fill={back} />}
      </g>
      {/* patas del lado cercano (esbozo → pata articulada) */}
      {bud && <path d={`M${f1(hip.x - 2)},${f1(hip.y - 3)} q-${f1(10 * s.hind * 3)},4 -${f1(8 * s.hind * 3)},${f1(10 * s.hind * 2.5)} q6,2 10,-6Z`} fill={limbCol} />}
      {hindK > 0.02 && <g filter={`url(#tl-${uid})`}>{hindNear.paths.map((d, i) => <path key={`hn${i}`} d={d} fill={limbCol} />)}</g>}
      {hindK > 0.3 && s.pigment > 0.4 && hindNear.joints.slice(0, 3).map((j, i) => <path key={`band${i}`} d={`M${f1(j.x - 6)},${f1(j.y - 5)} l10,9`} stroke={backDark} strokeWidth={4} strokeLinecap="round" opacity={0.45 * s.pigment} />)}
      {foreK > 0.02 && <g filter={`url(#tl-${uid})`}>{foreNear.paths.map((d, i) => <path key={`fn${i}`} d={d} fill={limbCol} />)}</g>}
    </g>
  );
};
