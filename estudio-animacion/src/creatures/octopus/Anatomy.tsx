// Visualizaciones científicas superpuestas al personaje (mismo rig, misma pose):
//  · Sistema circulatorio: 2 corazones branquiales en la base de cada branquia,
//    1 corazón sistémico, vena cava, vasos aferentes/eferentes y aortas.
//    Sangre desoxigenada casi incolora → azul tras pasar por las branquias
//    (la hemocianina oxigenada es azul).
//  · Sistema nervioso: cerebro alrededor del esófago, grandes lóbulos ópticos,
//    cordón nervioso axial en cada brazo con ganglios, y la comisura que une los brazos.
// Referencias generales: Wells (1978) "Octopus: physiology and behaviour of an
// advanced invertebrate"; Young (1971) "The anatomy of the nervous system of Octopus vulgaris".

import React from 'react';
import {clamp, smoothPath, TAU, Vec} from '../../engine/math';
import {OctopusPose} from './pose';

export const HEART_HZ = 0.75; // ritmo ilustrativo (compartido con tools/audio/score.py)
export const DEOXY = '#d2c8e6';
export const OXY = '#3f8cff';

/** Pulso de latido 0–1 (contracción rápida, relajación lenta). */
export function beat(t: number, phase = 0, hz = HEART_HZ) {
  const p = (((t * hz - phase) % 1) + 1) % 1;
  return p < 0.18 ? Math.sin((p / 0.18) * Math.PI) : 0;
}

/** Punto del manto en coordenadas locales: u a lo largo del eje (0 cuello … 1 punta; <0 hacia la cabeza), v transversal (−1…1). */
export function mantlePoint(pose: OctopusPose, u: number, v: number): Vec {
  const {axis, halfW, dir} = pose.mantle;
  const M = axis.length - 1;
  const ux = Math.cos(dir);
  const uy = Math.sin(dir);
  let c: Vec;
  let hw: number;
  if (u < 0) {
    const L = Math.hypot(axis[M].x - axis[0].x, axis[M].y - axis[0].y);
    c = {x: axis[0].x + ux * u * L, y: axis[0].y + uy * u * L};
    hw = halfW[0];
  } else {
    const f = Math.min(M - 1e-3, u * M);
    const i = Math.floor(f);
    const k = f - i;
    c = {x: axis[i].x + (axis[i + 1].x - axis[i].x) * k, y: axis[i].y + (axis[i + 1].y - axis[i].y) * k};
    hw = halfW[i] + (halfW[i + 1] - halfW[i]) * k;
  }
  return {x: c.x - uy * v * hw, y: c.y + ux * v * hw};
}

function samplePath(pts: Vec[], f: number): Vec {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const target = clamp(f) * lens[lens.length - 1];
  let i = 1;
  while (i < lens.length - 1 && lens[i] < target) i++;
  const k = (target - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
  return {x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k};
}

export type CirculatoryReveal = {
  outline: number; // contorno de rayos X
  gills: number;
  branchial: number;
  venous: number; // vena cava + aferentes con flujo
  systemic: number;
  arterial: number; // eferentes + aortas con flujo azul
};

/** Posiciones (locales) de los órganos, también útiles para colocar rótulos. */
export function organSites(pose: OctopusPose) {
  return {
    branchialL: mantlePoint(pose, 0.1, -0.5),
    branchialR: mantlePoint(pose, 0.1, 0.5),
    systemic: mantlePoint(pose, 0.24, 0),
    gillL: mantlePoint(pose, 0.42, -0.6),
    gillR: mantlePoint(pose, 0.42, 0.6),
  };
}

const Vessel: React.FC<{pts: Vec[]; color: string; reveal: number; width?: number}> = ({pts, color, reveal, width = 4.5}) => {
  if (reveal <= 0.001) return null;
  const d = smoothPath(pts);
  return (
    <g>
      <path d={d} stroke="#0a1630" strokeOpacity={0.7} strokeWidth={width + 3} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - reveal} />
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - reveal} />
    </g>
  );
};

const Flow: React.FC<{pts: Vec[]; color: string; t: number; amount: number; count?: number; speed?: number; glow?: boolean}> = ({
  pts,
  color,
  t,
  amount,
  count = 7,
  speed = 0.32,
  glow,
}) => {
  if (amount <= 0.01) return null;
  // el flujo se acelera con cada latido
  const push = t * speed + 0.06 * Math.floor(t * HEART_HZ) + 0.06 * clamp(((t * HEART_HZ) % 1) / 0.18);
  return (
    <g opacity={amount}>
      {Array.from({length: count}, (_, i) => {
        const p = samplePath(pts, (((i / count + push) % 1) + 1) % 1);
        return (
          <g key={i}>
            {glow && <circle cx={p.x} cy={p.y} r={6.5} fill={color} opacity={0.35} />}
            <circle cx={p.x} cy={p.y} r={3.4} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

const Heart: React.FC<{at: Vec; r: number; b: number; color: string; reveal: number; shape?: 'round' | 'ventricle'}> = ({at, r, b, color, reveal, shape = 'round'}) => {
  if (reveal <= 0.001) return null;
  const s = (0.6 + 0.4 * reveal) * (1 + 0.16 * b);
  return (
    <g transform={`translate(${at.x.toFixed(2)} ${at.y.toFixed(2)}) scale(${s.toFixed(4)})`} opacity={reveal}>
      <circle r={r * 1.9} fill={color} opacity={0.18 + 0.25 * b} />
      {shape === 'round' ? (
        <ellipse rx={r} ry={r * 0.86} fill={color} stroke="#1a0c2a" strokeWidth={1.6} />
      ) : (
        <path
          d={`M0,${r * 1.05} C${-r * 1.25},${r * 0.2} ${-r * 1.15},${-r * 0.95} ${-r * 0.35},${-r * 0.9} C${-r * 0.1},${-r * 0.88} 0,${-r * 0.6} 0,${-r * 0.5} C0,${-r * 0.6} ${r * 0.1},${-r * 0.88} ${r * 0.35},${-r * 0.9} C${r * 1.15},${-r * 0.95} ${r * 1.25},${r * 0.2} 0,${r * 1.05}Z`}
          fill={color}
          stroke="#2a0a18"
          strokeWidth={1.6}
        />
      )}
      <ellipse cx={-r * 0.32} cy={-r * 0.35} rx={r * 0.34} ry={r * 0.2} fill="#ffffff" opacity={0.45} />
    </g>
  );
};

/** Sistema circulatorio, dibujado en el espacio local del cuerpo. */
export const CirculatoryOverlay: React.FC<{pose: OctopusPose; reveal: CirculatoryReveal}> = ({pose, reveal}) => {
  const t = pose.t;
  const {body, mantle, head} = pose;
  const tf = `translate(${body.x.toFixed(2)} ${body.y.toFixed(2)}) rotate(${((body.rot * 180) / Math.PI).toFixed(3)}) scale(${body.scale.toFixed(4)})`;
  const mp = (u: number, v: number) => mantlePoint(pose, u, v);
  const site = organSites(pose);
  const bB = beat(t, 0);
  const bS = beat(t, 0.35);

  const sides = [-1, 1].map((sd) => {
    const stem = [mp(0.14, 0.46 * sd), mp(0.3, 0.6 * sd), mp(0.48, 0.64 * sd), mp(0.66, 0.56 * sd)];
    const lamellae: string[] = [];
    for (let k = 0; k <= 12; k++) {
      const f = k / 12;
      const p = samplePath(stem, f);
      const q = samplePath(stem, Math.min(1, f + 0.02));
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const L = 15 * Math.sin(Math.PI * (0.15 + 0.85 * f)) + 4;
      lamellae.push(`M${(p.x - (dy / d) * L).toFixed(1)},${(p.y + (dx / d) * L).toFixed(1)} L${(p.x + (dy / d) * L).toFixed(1)},${(p.y - (dx / d) * L).toFixed(1)}`);
    }
    return {
      sd,
      stem,
      lamellae,
      afferent: [sd < 0 ? site.branchialL : site.branchialR, mp(0.13, 0.48 * sd), ...stem.slice(1)],
      efferent: [mp(0.66, 0.5 * sd), mp(0.5, 0.42 * sd), mp(0.34, 0.26 * sd), mp(0.26, 0.1 * sd), site.systemic],
      venaBranch: [mp(-0.02, 0), mp(0.03, 0.28 * sd), sd < 0 ? site.branchialL : site.branchialR],
    };
  });
  const vena = [{x: head.cx, y: head.cy + head.h * 0.7}, {x: head.cx, y: head.cy}, mp(-0.02, 0)];
  const aortaHead = [site.systemic, mp(0.08, 0.06), {x: head.cx + 6, y: head.cy - 4}, {x: head.cx + 4, y: head.cy + head.h * 0.75}];
  const aortaBack = [site.systemic, mp(0.45, 0.04), mp(0.7, 0), mp(0.86, 0)];

  return (
    <g transform={tf}>
      {reveal.outline > 0.01 && (
        <g opacity={reveal.outline}>
          <path d={smoothPath(mantle.outline, true)} fill="rgba(80,200,255,0.06)" stroke="#8fe8ff" strokeWidth={2.4} />
          <ellipse cx={head.cx} cy={head.cy} rx={head.w} ry={head.h} fill="none" stroke="#8fe8ff" strokeWidth={2.4} strokeDasharray="6 5" />
        </g>
      )}
      {sides.map((sd) => (
        <g key={sd.sd}>
          {reveal.gills > 0.01 && (
            <g opacity={reveal.gills}>
              {sd.lamellae.map((d, i) => (
                <path key={i} d={d} stroke={i > 6 && reveal.arterial > 0.5 ? '#9cc4ff' : '#e6b7c8'} strokeWidth={3.2} strokeLinecap="round" />
              ))}
              <path d={smoothPath(sd.stem)} stroke="#f1d2de" strokeWidth={4} fill="none" strokeLinecap="round" />
            </g>
          )}
          <Vessel pts={sd.venaBranch} color={DEOXY} reveal={reveal.venous} />
          <Vessel pts={sd.afferent} color={DEOXY} reveal={reveal.venous} width={3.5} />
          <Vessel pts={sd.efferent} color={OXY} reveal={reveal.arterial} width={3.5} />
          <Flow pts={[...sd.venaBranch, ...sd.afferent]} color={DEOXY} t={t} amount={reveal.venous} count={8} />
          <Flow pts={sd.efferent} color={OXY} t={t} amount={reveal.arterial} count={6} glow />
        </g>
      ))}
      <Vessel pts={vena} color={DEOXY} reveal={reveal.venous} width={5.5} />
      <Flow pts={vena} color={DEOXY} t={t} amount={reveal.venous} count={4} />
      <Vessel pts={aortaHead} color={OXY} reveal={reveal.arterial} width={5} />
      <Vessel pts={aortaBack} color={OXY} reveal={reveal.arterial} width={4} />
      <Flow pts={aortaHead} color={OXY} t={t} amount={reveal.arterial} count={5} glow />
      <Flow pts={aortaBack} color={OXY} t={t} amount={reveal.arterial} count={4} glow />
      <Heart at={site.branchialL} r={11} b={bB} color="#9a7cc0" reveal={reveal.branchial} />
      <Heart at={site.branchialR} r={11} b={bB} color="#9a7cc0" reveal={reveal.branchial} />
      <Heart at={site.systemic} r={17} b={bS} color="#c8476e" reveal={reveal.systemic} shape="ventricle" />
    </g>
  );
};

/** Sistema nervioso: brazos en coordenadas de mundo, cerebro en coordenadas locales. */
export const NervousOverlay: React.FC<{pose: OctopusPose; reveal: number; brain: number}> = ({pose, reveal, brain}) => {
  if (reveal <= 0.01 && brain <= 0.01) return null;
  const t = pose.t;
  const {body, head, eyes} = pose;
  const tf = `translate(${body.x.toFixed(2)} ${body.y.toFixed(2)}) rotate(${((body.rot * 180) / Math.PI).toFixed(3)}) scale(${body.scale.toFixed(4)})`;
  const C = '#7ff7ff';
  const ring = [...pose.arms]
    .map((a) => a.pts[2])
    .sort((a, b) => Math.atan2(a.y - body.y, a.x - body.x) - Math.atan2(b.y - body.y, b.x - body.x));
  return (
    <g>
      <g opacity={reveal}>
        {pose.arms.map((a) => {
          const d = smoothPath(a.pts);
          const N = a.pts.length - 1;
          return (
            <g key={a.index}>
              <path d={d} stroke={C} strokeOpacity={0.22} strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d={d} stroke={C} strokeWidth={2.4} fill="none" strokeLinecap="round" />
              {a.pts.map((p, k) => (k > 0 && k < N && k % 1 === 0 ? <circle key={k} cx={p.x} cy={p.y} r={Math.max(1.4, a.widths[k] * 0.18)} fill="#d8ffff" /> : null))}
              {[0, 1, 2].map((j) => {
                // impulsos nerviosos que viajan (unos hacia la punta, otros de vuelta)
                const f = (((t * 0.55 + a.index * 0.137 + j / 3) % 1) + 1) % 1;
                const p = samplePath(a.pts, a.index % 2 ? f : 1 - f);
                return (
                  <g key={j}>
                    <circle cx={p.x} cy={p.y} r={9} fill={C} opacity={0.3} />
                    <circle cx={p.x} cy={p.y} r={4} fill="#ffffff" />
                  </g>
                );
              })}
            </g>
          );
        })}
        <path d={smoothPath(ring, true)} stroke={C} strokeWidth={3} fill="none" opacity={0.9} />
      </g>
      <g transform={tf} opacity={brain}>
        {/* conexiones cerebro → lóbulos ópticos y → corona de brazos */}
        {eyes.map((e, i) => (
          <path key={i} d={`M${head.cx},${head.cy - 4} Q${(head.cx + e.local.x) / 2},${head.cy - 20} ${e.local.x * 0.82 + head.cx * 0.18},${e.local.y + 6}`} stroke={C} strokeWidth={3} fill="none" />
        ))}
        {Array.from({length: 8}, (_, i) => {
          const a = ((i + 0.5) / 8) * TAU;
          return <path key={i} d={`M${head.cx},${head.cy + 6} L${Math.cos(a) * 34},${Math.sin(a) * 9}`} stroke={C} strokeWidth={2} opacity={0.7} />;
        })}
        {eyes.map((e, i) => (
          <ellipse key={`o${i}`} cx={e.local.x * 0.82 + head.cx * 0.18} cy={e.local.y + 8} rx={11 * (i === 1 && e.behind ? 0.6 : 1)} ry={8} fill="#ffd27a" opacity={0.95} />
        ))}
        <circle cx={head.cx} cy={head.cy - 2} r={24 + 2 * Math.sin(t * 6)} fill="#ffd27a" opacity={0.22} />
        <ellipse cx={head.cx} cy={head.cy - 6} rx={17} ry={11} fill="#ffd27a" />
        <ellipse cx={head.cx} cy={head.cy + 9} rx={13} ry={7} fill="#ffc25a" />
        <ellipse cx={head.cx} cy={head.cy + 1} rx={4} ry={9} fill="#0a1630" opacity={0.6} />
      </g>
    </g>
  );
};
