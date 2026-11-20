// CAMPANA de Turritopsis dohrnii (vista de 3/4, eje vertical, boca hacia abajo).
// Anatomía inspirada en referencias reales: campana transparente algo más alta que ancha, mesoglea
// gruesa en el ápice, MANUBRIO grande y rojo (estómago) con cuatro labios, gónadas sobre el manubrio,
// cuatro canales radiales, canal circular en el borde, velo y bulbos tentaculares rojizos.
// Parámetros de forma: contracción, eversión (la campana se repliega hacia fuera) y "masa" (se
// reorganiza en una bola de tejido), usados por la transformación sin fundidos de opacidad.
import React from 'react';
import {clamp, hash1, lerp, mixColor} from '../../../engine/math';

export const JELLY = {bell: '#8fe9ff', bell2: '#b799ff', rim: '#d6f8ff', canal: '#e8fbff', stomach: '#e2343f', stomachLight: '#ff7a6a', gonad: '#ff9c5a', bulb: '#ff5a4a', tissue: '#f2a070'};
const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);

export type BellShape = {R: number; H: number; ry: number; outer: {x: number; y: number}[]; inner: {x: number; y: number}[]};

/** Perfil de la campana: R radio del borde, H altura; c contracción, ev eversión, blob masa. */
export function bellShape(c: number, ev = 0, blob = 0, t = 0): BellShape {
  const R = 100 * (1 - 0.27 * c) * (1 - 0.15 * ev);
  const H = 112 * (1 + 0.13 * c) * (1 - 0.45 * ev);
  const ry = R * 0.22 * (1 - ev * 0.6);
  const N = 40;
  const outer: {x: number; y: number}[] = [];
  const inner: {x: number; y: number}[] = [];
  const cy = -H * 0.45;
  const br = 46 + 8 * Math.sin(t * 1.3); // radio de la masa de tejido
  for (let i = 0; i <= N; i++) {
    const u = -1 + (2 * i) / N; // borde izq. → ápice → borde der.
    const a = Math.abs(u);
    let x = R * u;
    let y = -H * Math.pow(1 - Math.pow(a, 2.3), 1 / 2.3);
    // el borde se curva un poco hacia dentro (velo) y ondula al nadar
    const edge = Math.pow(a, 8);
    x -= Math.sign(u) * edge * R * 0.05;
    y += Math.sin(u * 7 + t * 3) * 1.2;
    // eversión: el ápice se aplana y los bordes se doblan hacia arriba y hacia fuera
    if (ev > 0) {
      y += ev * (H * 0.55 * (1 - a) - edge * H * 0.9);
      x += Math.sign(u) * ev * edge * R * 0.25;
    }
    // masa: los puntos convergen a un círculo (tejido reorganizado)
    if (blob > 0) {
      const ang = Math.PI + (Math.PI * (u + 1)) / 2; // semicírculo superior
      const bx = Math.cos(ang) * br * (1 + 0.06 * Math.sin(i * 1.7 + t * 2));
      const by = cy + Math.sin(ang) * br * (1 + 0.06 * Math.sin(i * 2.3 + t * 1.6));
      x = lerp(x, bx, blob);
      y = lerp(y, by, blob);
    }
    outer.push({x, y});
    const k = 0.84;
    inner.push({x: x * k, y: lerp(y * 0.62, y, edge)});
  }
  if (blob > 0) {
    // mitad inferior de la masa para cerrar la forma
    for (let i = N; i >= 0; i--) {
      const ang = (Math.PI * i) / N;
      const bx = Math.cos(ang) * br * (1 + 0.06 * Math.sin(i * 1.3 + t * 2.2));
      const by = cy + Math.sin(ang) * br;
      const last = outer[outer.length - 1];
      outer.push({x: lerp(last.x, bx, blob), y: lerp(0, by, blob)});
    }
  }
  return {R, H, ry, outer, inner};
}

const path = (pts: {x: number; y: number}[], close = false) => {
  let d = `M${f1(pts[0].x)},${f1(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${f1(pts[i].x)},${f1(pts[i].y)} ${f1(mx)},${f1(my)}`;
  }
  d += ` L${f1(pts[pts.length - 1].x)},${f1(pts[pts.length - 1].y)}`;
  return d + (close ? 'Z' : '');
};

/** Parte trasera de la campana (se dibuja detrás de los tentáculos delanteros). */
export const BellBack: React.FC<{s: BellShape; uid: string; glow: number; tissue: number}> = ({s, uid, glow, tissue}) => {
  const fill = mixColor(JELLY.bell, JELLY.tissue, tissue);
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}b`} cx="0.36" cy="0.25" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.35" stopColor={fill} stopOpacity={0.3 + 0.25 * tissue} />
          <stop offset="0.8" stopColor={mixColor(JELLY.bell2, JELLY.tissue, tissue)} stopOpacity={0.2 + 0.35 * tissue} />
          <stop offset="1" stopColor={JELLY.rim} stopOpacity={0.55} />
        </radialGradient>
        <radialGradient id={`${uid}h`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={JELLY.bell} stopOpacity={0.35 * glow} />
          <stop offset="1" stopColor={JELLY.bell2} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* halo de luz alrededor (iluminación azul-turquesa-violeta) */}
      <ellipse cx={0} cy={-s.H * 0.4} rx={s.R * 2.3} ry={s.H * 1.9} fill={`url(#${uid}h)`} />
      {/* interior de la subumbrela (pared del fondo) */}
      <path d={path(s.inner)} fill={mixColor(JELLY.bell2, '#20104a', 0.3)} opacity={0.18 * (1 - tissue)} />
      <ellipse cx={0} cy={0} rx={s.R * 0.95} ry={s.ry} fill={JELLY.bell2} opacity={0.12 * (1 - tissue)} />
    </g>
  );
};

/** Parte delantera: cuerpo translúcido, estructuras internas, brillos y refracción. */
export const BellFront: React.FC<{s: BellShape; uid: string; t: number; glow: number; tissue: number; c: number; cells: number}> = ({s, uid, t, glow, tissue, c, cells}) => {
  const {R, H, ry} = s;
  const inner = 1 - tissue;
  const apexIn = -H * 0.62;
  const mw = R * (0.36 - 0.06 * c);
  const mTop = apexIn + 6;
  const mBot = H * 0.06;
  // manubrio: tubo carnoso rojo, ancho en el centro, que termina en cuatro labios ondulados
  const lip = (k: number) => Math.sin(p2(t) + k) * 2;
  const p2 = (tt: number) => tt * 2.2;
  const stomach = `M${f1(-mw * 0.32)},${f1(mTop)} C${f1(-mw * 0.95)},${f1(lerp(mTop, mBot, 0.3))} ${f1(-mw * 0.95)},${f1(lerp(mTop, mBot, 0.7))} ${f1(-mw * 0.62)},${f1(mBot - 8)} Q${f1(-mw * 0.7)},${f1(mBot + 10 + lip(0))} ${f1(-mw * 0.32)},${f1(mBot + 2)} Q${f1(-mw * 0.16)},${f1(mBot + 14 + lip(1))} ${f1(0)},${f1(mBot + 4)} Q${f1(mw * 0.16)},${f1(mBot + 14 + lip(2))} ${f1(mw * 0.32)},${f1(mBot + 2)} Q${f1(mw * 0.7)},${f1(mBot + 10 + lip(3))} ${f1(mw * 0.62)},${f1(mBot - 8)} C${f1(mw * 0.95)},${f1(lerp(mTop, mBot, 0.7))} ${f1(mw * 0.95)},${f1(lerp(mTop, mBot, 0.3))} ${f1(mw * 0.32)},${f1(mTop)}Z`;
  const id = `${uid}c`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={path(s.outer, true)} />
        </clipPath>
        <linearGradient id={`${uid}m`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a1020" />
          <stop offset="0.45" stopColor={JELLY.stomach} />
          <stop offset="0.7" stopColor={JELLY.stomachLight} />
          <stop offset="1" stopColor="#9a1828" />
        </linearGradient>
      </defs>
      {/* cuerpo (mesoglea) */}
      <path d={path(s.outer, true)} fill={`url(#${uid}b)`} />
      <g clipPath={`url(#${id})`}>
        {/* canales radiales y canal circular */}
        {inner > 0.02 && (
          <g opacity={0.75 * inner} stroke={JELLY.canal} fill="none" strokeLinecap="round">
            {[-0.62, 0, 0.62].map((k, i) => (
              <path key={i} d={`M${f1(k * R * 0.12)},${f1(apexIn)} Q${f1(k * R * 0.75)},${f1(apexIn * 0.45)} ${f1(k * R * 0.86)},${f1(ry * 0.55 * (i === 1 ? 1 : 0.4))}`} strokeWidth={i === 1 ? 2.4 : 1.8} />
            ))}
            <ellipse cx={0} cy={-2} rx={R * 0.9} ry={ry * 0.85} strokeWidth={2} opacity={0.8} />
          </g>
        )}
        {/* manubrio rojo (estómago) con gónadas */}
        {inner > 0.02 && (
          <g opacity={inner} transform={`translate(0 ${f1(c * 8)}) scale(${f1(1 - 0.1 * c)} 1)`}>
            <path d={stomach} fill={`url(#${uid}m)`} stroke="#5a0814" strokeWidth={1.6} />
            {/* gónadas: bandas alargadas sobre las paredes del manubrio */}
            {[-1, 1].map((sd) => (
              <path key={sd} d={`M${f1(sd * mw * 0.45)},${f1(lerp(mTop, mBot, 0.18))} Q${f1(sd * mw * 0.92)},${f1(lerp(mTop, mBot, 0.5))} ${f1(sd * mw * 0.5)},${f1(lerp(mTop, mBot, 0.82))}`} stroke={JELLY.gonad} strokeWidth={mw * 0.28} fill="none" strokeLinecap="round" opacity={0.55} />
            ))}
            {Array.from({length: 7}, (_, i) => (
              <path key={`f${i}`} d={`M${f1(-mw * 0.5 + i * mw * 0.16)},${f1(mTop + 8)} q${f1(mw * 0.05)},${f1((mBot - mTop) * 0.4)} 0,${f1((mBot - mTop) * 0.8)}`} stroke="#8a1020" strokeWidth={1.2} opacity={0.35} fill="none" />
            ))}
            <path d={`M${f1(-mw * 0.2)},${f1(mTop + 10)} Q${f1(-mw * 0.45)},${f1(lerp(mTop, mBot, 0.5))} ${f1(-mw * 0.3)},${f1(mBot - 14)}`} stroke="#ffffff" strokeWidth={3} opacity={0.35} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* células visibles durante la reorganización */}
        {cells > 0.02 &&
          Array.from({length: 46}, (_, i) => {
            const a = hash1(i * 3.3) * Math.PI * 2;
            const r = Math.sqrt(hash1(i * 7.1)) * R * 0.5;
            const cx = Math.cos(a + t * 0.2 * (hash1(i) - 0.5)) * r;
            const cy = -H * 0.45 + Math.sin(a) * r * 0.9;
            const rr = 4 + hash1(i * 2) * 5;
            return (
              <g key={i} opacity={cells}>
                <circle cx={cx} cy={cy} r={rr} fill={mixColor('#ffd2b0', '#ff8a6a', hash1(i * 5))} opacity={0.7} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.8} />
                <circle cx={cx + rr * 0.2} cy={cy - rr * 0.1} r={rr * 0.35} fill="#a8443a" opacity={0.6} />
              </g>
            );
          })}
        {/* refracción: cáusticas en movimiento dentro de la campana */}
        {Array.from({length: 5}, (_, i) => {
          const y0 = -H * (0.15 + i * 0.17);
          return <path key={`k${i}`} d={`M${f1(-R)},${f1(y0 + Math.sin(t * 1.1 + i) * 6)} Q${f1(-R * 0.3)},${f1(y0 - 14 + Math.sin(t * 1.7 + i * 2) * 8)} ${f1(0)},${f1(y0 + Math.sin(t * 1.3 + i) * 7)} T${f1(R)},${f1(y0 + Math.sin(t + i) * 6)}`} stroke="#ffffff" strokeWidth={2.2} opacity={0.12 + 0.08 * Math.sin(t * 2 + i)} fill="none" />;
        })}
      </g>
      {/* borde: canal circular, velo y bulbos tentaculares */}
      <ellipse cx={0} cy={0} rx={R * 0.97} ry={ry} fill="none" stroke={JELLY.rim} strokeWidth={2.6} opacity={0.75 * inner * inner} />
      <path d={`M${f1(-R * 0.82)},${f1(ry * 0.3)} Q0,${f1(ry * 1.9)} ${f1(R * 0.82)},${f1(ry * 0.3)}`} stroke={JELLY.rim} strokeWidth={6} fill="none" opacity={0.18 * inner} />
      {/* contorno con efecto Fresnel (más luz en los bordes) */}
      <path d={path(s.outer, tissue > 0.5)} fill="none" stroke={mixColor(JELLY.rim, '#ffd8c0', tissue)} strokeWidth={9} opacity={0.12 + 0.12 * glow} />
      <path d={path(s.outer, tissue > 0.5)} fill="none" stroke={mixColor(JELLY.rim, '#ffd8c0', tissue)} strokeWidth={2.4} opacity={0.85} />
      {/* brillo especular */}
      <path d={`M${f1(-R * 0.62)},${f1(-H * 0.55)} Q${f1(-R * 0.45)},${f1(-H * 0.92)} ${f1(-R * 0.05)},${f1(-H * 0.97)}`} stroke="#ffffff" strokeWidth={5} opacity={0.55 * inner * inner} fill="none" strokeLinecap="round" />
      <ellipse cx={R * 0.38} cy={-H * 0.72} rx={R * 0.08} ry={H * 0.04} fill="#ffffff" opacity={0.4 * inner * inner} />
    </g>
  );
};

export const bellPoints = (s: BellShape, n: number, seed = 0) =>
  Array.from({length: n}, (_, j) => {
    const a = (j / n) * Math.PI * 2 + (hash1(j * 3.7 + seed) - 0.5) * 0.12;
    return {a, x: Math.cos(a) * s.R * 0.95, y: Math.sin(a) * s.ry, front: Math.sin(a) > 0};
  });
export const clampK = clamp;
